import lodash from 'lodash';
import * as vscode from 'vscode';
import Cache from 'vscode-cache';
import { findStackingContexts } from './helpers/findStackingContexts';
import { Logger } from './helpers/logger';
import { triggerUpdateDecorations } from './helpers/triggerUpdateDecorations';
import { StackingContextsProvider } from './providers/StackingContextsProvider';

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('betterStackingContexts');
  const stackingContextsProvider = new StackingContextsProvider([]);
  const cache = new Cache(context, 'stackingContextsCache');

  vscode.window.registerTreeDataProvider(
    'stackingContextsView',
    stackingContextsProvider,
  );

  const updateTreeView = async (document?: vscode.TextDocument) => {
    if (
      document &&
      (document.languageId === 'css' || document.languageId === 'scss')
    ) {
      const cacheKey = document.uri.toString();
      let stackingContexts = cache.get(cacheKey);

      if (!stackingContexts) {
        stackingContexts = await findStackingContexts(
          document.getText(),
          document.languageId === 'scss',
        );
        await cache.put(cacheKey, stackingContexts);
      }
      const documentUri = document.uri;

      stackingContextsProvider.refresh(stackingContexts, documentUri);
    }
  };
  const debouncedUpdateTreeView = lodash.debounce(updateTreeView, 200);

  const debouncedTriggerUpdateDecorations = lodash.debounce(
    (document) => triggerUpdateDecorations(document, config),
    200,
  );

  if (vscode.window.activeTextEditor) {
    debouncedUpdateTreeView(vscode.window.activeTextEditor.document);
    debouncedTriggerUpdateDecorations(vscode.window.activeTextEditor.document);
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        debouncedUpdateTreeView(editor.document);
        debouncedTriggerUpdateDecorations(editor.document);
      }
    },
    null,
    context.subscriptions,
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        debouncedUpdateTreeView(vscode.window.activeTextEditor.document);
        debouncedTriggerUpdateDecorations(
          vscode.window.activeTextEditor.document,
        );
      }
    },
    null,
    context.subscriptions,
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'stackingContexts.navigateToProperty',
      async (documentUri: vscode.Uri, range: vscode.Range) => {
        console.log('navigateToProperty called with:', documentUri, range);

        let editor = vscode.window.visibleTextEditors.find(
          (e) => e.document.uri.toString() === documentUri.toString(),
        );

        if (!editor) {
          const document = await vscode.workspace.openTextDocument(documentUri);
          editor = await vscode.window.showTextDocument(document);
        } else {
          await vscode.window.showTextDocument(
            editor.document,
            editor.viewColumn,
          );
        }

        // Adjust the selection to focus on the start of the declaration
        const startPosition = range.start;
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        editor.selection = new vscode.Selection(startPosition, startPosition);
      },
    ),
  );
  Logger.info(
    'vscode-better-stacking-contexts is now active. Please open a CSS or SCSS file to see the extension in action.',
  );
}

export function deactivate() {}
