import vscode from 'vscode';
import { StackingContext } from '../types/StackingContext';
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
    ' 🤐 This property creates a new stacking context',
  );
  findStackingContexts(document.getText(), isScss).then(
    (stackingContexts: StackingContext[]) => {
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
            document.positionAt(context.start.offset),
            document.positionAt(context.end.offset),
          ),
      );

      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.uri === document.uri) {
        activeEditor.setDecorations(decorationType, ranges);
      }
    },
  );
}
