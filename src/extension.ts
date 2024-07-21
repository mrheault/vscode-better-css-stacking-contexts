import lodash from 'lodash';
import * as vscode from 'vscode';
import Cache from 'vscode-cache';
import { NavigateToPropertyCommand } from './commands/NavigateToProperty';
import { findStackingContexts } from './helpers/findStackingContexts';
import { getSetStackingContexts } from './helpers/getSetStackingContextsCache';
import { Logger } from './helpers/logger';
import { triggerUpdateDecorations } from './helpers/triggerUpdateDecorations';
import { IneffectiveZIndexCodeActionProvider } from './providers/IneffectiveZIndexCodeActionProvider';
import { StackingContextsAndZIndexProvider } from './providers/StackingContextsAndZIndexProvider';
import { StackingContextsProvider } from './providers/StackingContextsProvider';
import { diagnosticsCollection, DOCUMENT_SELECTOR } from './contants/globals';

export function activate(context: vscode.ExtensionContext) {
  const cache = new Cache(context, 'betterStackingContextsCache');
  const navigateToPropertyCommand = new NavigateToPropertyCommand();
  const stackingContextsProvider = new StackingContextsProvider([]);
  const decorationsProvider = new StackingContextsAndZIndexProvider(cache);
  let refreshCommand = vscode.commands.registerCommand(
    'stackingContexts.refreshView',
    async function () {
      if (vscode.window.activeTextEditor) {
        const document = vscode.window.activeTextEditor.document;
        const documentUri = document.uri;
        cache.forget(document.uri.toString());
        stackingContextsProvider.refresh([], documentUri);
        const stackingContexts = await getSetStackingContexts(document, cache);
        if (stackingContexts) {
          stackingContextsProvider.refresh(stackingContexts, documentUri);
        }
      }
    },
  );

  function registerCommands() {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'stackingContexts.navigateToProperty',
        navigateToPropertyCommand.execute,
      ),
    );
  }

  function registerProviders() {
    vscode.window.registerTreeDataProvider(
      'stackingContextsView',
      stackingContextsProvider,
    );
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        DOCUMENT_SELECTOR,
        new IneffectiveZIndexCodeActionProvider(),
        {
          providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
        },
      ),
    );
  }

  context.subscriptions.push(
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
      const stackingContexts = await getSetStackingContexts(document, cache);
      if (stackingContexts) {
        const documentUri = document.uri;
        stackingContextsProvider.refresh(stackingContexts, documentUri);
      }
    }
  };
  const debouncedUpdateTreeView = lodash.debounce(updateTreeView, 300);

  const debouncedTriggerUpdateDecorations = lodash.debounce(
    (document) => decorationsProvider.updateDecorations(document),
    300,
  );

  const debouncedTriggerZIndexDiagnostic = lodash.debounce(
    (document) => decorationsProvider.provideZIndexDiagnostic(document),
    300,
  );

  if (vscode.window.activeTextEditor) {
    try {
      debouncedUpdateTreeView(vscode.window.activeTextEditor.document);
      debouncedTriggerUpdateDecorations(
        vscode.window.activeTextEditor.document,
      );
      debouncedTriggerZIndexDiagnostic(vscode.window.activeTextEditor.document);
    } catch (e) {
      Logger.error((e as Error).message);
    }
  }
  vscode.workspace.onDidChangeTextDocument(async (event) => {
    if (
      event.document.languageId === 'css' ||
      event.document.languageId === 'scss'
    ) {
      // Invalidate the cache
      cache.forget(event.document.uri.toString());

      await getSetStackingContexts(event.document, cache);
    }
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      debouncedTriggerZIndexDiagnostic(event.document);
    }
  });
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        try {
          debouncedUpdateTreeView(editor.document);
          debouncedTriggerUpdateDecorations(editor.document);
          debouncedTriggerZIndexDiagnostic(editor.document);
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
          debouncedUpdateTreeView(event.document);
          debouncedTriggerUpdateDecorations(event.document);
          debouncedTriggerZIndexDiagnostic(event.document);
        } catch (e) {
          Logger.error((e as Error).message);
        }
      }
    },
    null,
    context.subscriptions,
  );

  registerCommands();
  registerProviders();

  context.subscriptions.push(diagnosticsCollection);
  context.subscriptions.push(refreshCommand);

  Logger.info(
    'vscode-better-stacking-contexts is now active. Please open a CSS or SCSS file to see the extension in action.',
  );
}

export function deactivate() {}
