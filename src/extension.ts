import debounce from "lodash.debounce";
import * as vscode from "vscode";
import Cache from "vscode-cache";
import { NavigateToPropertyCommand } from "./commands/NavigateToProperty";
import { getSetStackingContexts } from "./helpers/getSetStackingContextsCache";
import { Logger } from "./helpers/logger";
import { IneffectiveZIndexCodeActionProvider } from "./providers/IneffectiveZIndexCodeActionProvider";
import { StackingContextDecorationProvider } from "./providers/StackingContextsDecorationProvider";
import { StackingContextsProvider } from "./providers/StackingContextsProvider";
import { diagnosticsCollection, DOCUMENT_SELECTOR } from "./contants/globals";
import { ZIndexDiagnosticsProvider } from "./providers/ZIndexDiagnosticsProvider";

/**
 * Activate the extension
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
  const cache = new Cache(context, "betterStackingContextsCacheV1");
  const navigateToPropertyCommand = new NavigateToPropertyCommand();
  const stackingContextsProvider = new StackingContextsProvider([]);
  const decorationsProvider = new StackingContextDecorationProvider(cache);
  const zIndexDiagnosticsProvider = new ZIndexDiagnosticsProvider();

  /**
   * Register all commands
   */
  function registerCommands() {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "stackingContexts.refreshView",
        refreshView,
      ),
      vscode.commands.registerCommand(
        "stackingContexts.navigateToProperty",
        navigateToPropertyCommand.execute,
      ),
    );
  }

  /**
   * Register all providers
   */
  function registerProviders() {
    vscode.window.registerTreeDataProvider(
      "stackingContextsView",
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

  /**
   * Register all event listeners
   */
  function registerEventListeners() {
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(handleConfigChange),
      vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange),
      vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange),
    );
  }

  /**
   * Refresh the view
   */
  async function refreshView() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      cache.forget(document.uri.toString());
      const stackingContexts = await getSetStackingContexts(document, cache);
      if (stackingContexts) {
        stackingContextsProvider.refresh(stackingContexts, document.uri);
      }
    }
  }

  const debouncedUpdateTreeView = debounce(updateTreeView, 300);
  const debouncedUpdateDecorations = debounce(
    (document) => decorationsProvider.updateDecorations(document),
    300,
  );
  const debouncedZIndexDiagnostic = debounce(
    (document) => zIndexDiagnosticsProvider.provideZIndexDiagnostic(document),
    300,
  );

  /**
   * Handle configuration changes
   * @param e
   */
  function handleConfigChange(e: vscode.ConfigurationChangeEvent) {
    if (e.affectsConfiguration("betterStackingContexts")) {
      decorationsProvider.updateConfigValues();
    }
  }

  /**
   * Handle editor updates
   * @param document
   */
  function handleEditorUpdates(document: vscode.TextDocument) {
    debouncedUpdateTreeView(document);
    debouncedUpdateDecorations(document);
    debouncedZIndexDiagnostic(document);
  }

  /**
   * Handle active editor change
   * @param editor
   */
  function handleActiveEditorChange(editor: vscode.TextEditor | undefined) {
    if (editor) {
      handleEditorUpdates(editor.document);
    }
  }

  /**
   * Handle text document change
   * @param event
   */
  function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
    if (["css", "scss"].includes(event.document.languageId)) {
      cache.forget(event.document.uri.toString());
      getSetStackingContexts(event.document, cache);
    }
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && event.document === activeEditor.document) {
      handleEditorUpdates(event.document);
    }
  }

  /**
   * Update the tree view
   * @param document
   */
  async function updateTreeView(document?: vscode.TextDocument) {
    if (
      document &&
      (document.languageId === "css" || document.languageId === "scss")
    ) {
      const stackingContexts = await getSetStackingContexts(document, cache);
      if (stackingContexts) {
        const documentUri = document.uri;
        stackingContextsProvider.refresh(stackingContexts, documentUri);
      }
    }
  }

  /**
   * Handle initial activation
   */
  if (vscode.window.activeTextEditor) {
    try {
      handleEditorUpdates(vscode.window.activeTextEditor.document);
    } catch (e) {
      Logger.error((e as Error).message);
    }
  }

  /**
   * Register all commands, providers and event listeners
   */
  registerCommands();
  registerProviders();
  registerEventListeners();

  /**
   * Add the diagnostics collection to the subscriptions
   */
  context.subscriptions.push(diagnosticsCollection);

  Logger.info(
    "vscode-better-stacking-contexts is now active. Please open a CSS or SCSS file to see the extension in action.",
  );
}

export function deactivate() {}
