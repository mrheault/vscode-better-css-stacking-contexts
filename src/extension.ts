import lodash from 'lodash';
import * as vscode from 'vscode';
import Cache from 'vscode-cache';
import { NavigateToPropertyCommand } from './commands/NavigateToProperty';
import { findStackingContexts } from './helpers/findStackingContexts';
import { Logger } from './helpers/logger';
import { triggerUpdateDecorations } from './helpers/triggerUpdateDecorations';
import { StackingContextsProvider } from './providers/StackingContextsProvider';

export function activate(context: vscode.ExtensionContext) {
  const navigateToPropertyCommand = new NavigateToPropertyCommand();
  const stackingContextsProvider = new StackingContextsProvider([]);
  const cache = new Cache(context, 'stackingContextsCacheNew');

  vscode.window.registerTreeDataProvider(
    'stackingContextsView',
    stackingContextsProvider,
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'stackingContexts.navigateToProperty',
      async (documentUri: vscode.Uri, range) => {
        await navigateToPropertyCommand.execute(documentUri, range);
      },
    ),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration('betterStackingContexts.decorationColor') ||
        e.affectsConfiguration('betterStackingContexts.messageText')
      ) {
        if (vscode.window.activeTextEditor) {
          const document = vscode.window.activeTextEditor.document;
          triggerUpdateDecorations(document)
            .then(() => {
              Logger.info('Decorations updated successfully');
            })
            .catch((error) => {
              Logger.error(`Failed to update decorations: ${error.message}`);
            });
        }
      }
    }),
  );

  const updateTreeView = async (document?: vscode.TextDocument) => {
    if (
      document &&
      (document.languageId === 'css' || document.languageId === 'scss')
    ) {
      const cacheKey = document.uri.toString();
      let stackingContexts;
      try {
        stackingContexts = cache.get(cacheKey);
        if (!stackingContexts) {
          stackingContexts = await findStackingContexts(
            document.getText(),
            document.languageId === 'scss',
          );
          await cache.put(cacheKey, stackingContexts);
        }
      } catch (e) {
        Logger.error(`Failed to access cache: ${(e as Error).message}`);
      }
      if (stackingContexts) {
        const documentUri = document.uri;
        stackingContextsProvider.refresh(stackingContexts, documentUri);
      }
    }
  };
  const debouncedUpdateTreeView = lodash.debounce(updateTreeView, 200);

  const debouncedTriggerUpdateDecorations = lodash.debounce(
    (document) => triggerUpdateDecorations(document),
    200,
  );

  if (vscode.window.activeTextEditor) {
    try {
      debouncedUpdateTreeView(vscode.window.activeTextEditor.document);
      debouncedTriggerUpdateDecorations(
        vscode.window.activeTextEditor.document,
      );
    } catch (e) {
      Logger.error((e as Error).message);
    }
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        try {
          debouncedUpdateTreeView(editor.document);
          debouncedTriggerUpdateDecorations(editor.document);
        } catch (e) {
          Logger.error((e as Error).message);
        }
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
        try {
          debouncedUpdateTreeView(vscode.window.activeTextEditor.document);
          debouncedTriggerUpdateDecorations(
            vscode.window.activeTextEditor.document,
          );
        } catch (e) {
          Logger.error((e as Error).message);
        }
      }
    },
    null,
    context.subscriptions,
  );
  Logger.info(
    'vscode-better-stacking-contexts is now active. Please open a CSS or SCSS file to see the extension in action.',
  );
}

export function deactivate() {}
