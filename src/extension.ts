import * as vscode from 'vscode';
import lodash from 'lodash';
import { findStackingContexts } from './helpers/findStackingContexts';
import { StackingContextsProvider } from './providers/StackingContextsProvider';
function isFileScss(filePath: string): boolean {
  const extension = filePath.split('.').pop();
  return extension === 'scss';
}

function triggerUpdateDecorations(
  document: vscode.TextDocument,
  config: vscode.WorkspaceConfiguration,
) {
  const isScss =
    document.languageId === 'scss' || isFileScss(document.fileName);
  if (!['css', 'scss'].includes(document.languageId)) {
    return;
  }
  const decorationColor = config.get(
    'decorationColor',
    'editorInfo.foreground',
  );
  const messageText = config.get(
    'messageText',
    ' ⓘ This property creates a new stacking context',
  );
  findStackingContexts(document.getText(), isScss).then((stackingContexts) => {
    const decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        color: new vscode.ThemeColor(decorationColor),
        contentText: messageText,
      },
      isWholeLine: true,
    });

    const ranges = stackingContexts.map(
      (context) =>
        new vscode.Range(
          document.positionAt(context.start),
          document.positionAt(context.end),
        ),
    );

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri === document.uri) {
      activeEditor.setDecorations(decorationType, ranges);
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log(
    '"vscode-better-stacking-contexts" is now active. Please open a CSS or SCSS file to see the extension in action.',
  );
  const config = vscode.workspace.getConfiguration('betterStackingContexts');
  const stackingContextsProvider = new StackingContextsProvider([]);
  vscode.window.registerTreeDataProvider(
    'stackingContextsView',
    stackingContextsProvider,
  );

  const updateTreeView = async (document?: vscode.TextDocument) => {
    if (
      document &&
      (document.languageId === 'css' || document.languageId === 'scss')
    ) {
      const stackingContexts = await findStackingContexts(
        document.getText(),
        document.languageId === 'scss',
      );
      stackingContextsProvider.refresh(stackingContexts);
    }
  };

  const debouncedTriggerUpdateDecorations = lodash.debounce(
    (document) => triggerUpdateDecorations(document, config),
    200,
  );

  if (vscode.window.activeTextEditor) {
    updateTreeView(vscode.window.activeTextEditor.document).catch(
      console.error,
    );
    debouncedTriggerUpdateDecorations(vscode.window.activeTextEditor.document);
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        updateTreeView(editor.document).catch(console.error);
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
        updateTreeView(vscode.window.activeTextEditor.document).catch(
          console.error,
        );
        debouncedTriggerUpdateDecorations(
          vscode.window.activeTextEditor.document,
        );
      }
    },
    null,
    context.subscriptions,
  );
}

export function deactivate() {}
