import vscode from 'vscode';
import { findStackingContexts } from './findStackingContexts';
import { isFileScss } from './isFileScss';

export async function triggerUpdateDecorations(
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
