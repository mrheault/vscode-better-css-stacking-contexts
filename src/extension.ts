// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { findStackingContexts } from './helpers/findStackingContexts';
function isFileScss(filePath: string): boolean {
  const extension = filePath.split('.').pop();
  return extension === 'scss';
}
function triggerUpdateDecorations(document: vscode.TextDocument) {
  const isScss =
    document.languageId === 'scss' || isFileScss(document.fileName);
  if (!['css', 'scss'].includes(document.languageId)) {
    return;
  }

  findStackingContexts(document.getText(), isScss).then((stackingContexts) => {
    const decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        color: new vscode.ThemeColor('editorInfo.foreground'),
        contentText: ' ⓘ This property creates a new stacking context',
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    '"vscode-better-stacking-contexts" is now active. Please open a CSS or SCSS file to see the extension in action.',
  );
  const activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    triggerUpdateDecorations(activeEditor.document);
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        triggerUpdateDecorations(editor.document);
      }
    },
    null,
    context.subscriptions,
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(activeEditor.document);
      }
    },
    null,
    context.subscriptions,
  );
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    'vscode-better-stacking-contexts.helloWorld',
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        'Hello World from vscode-better-stacking-contexts!',
      );
    },
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
