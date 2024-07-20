import vscode from 'vscode';
import { StackingContext } from '../types/StackingContext';
import { findStackingContexts } from './findStackingContexts';
import { isFileScss } from './isFileScss';
import { Logger } from './logger'; // Ensure you have imported Logger correctly

export async function triggerUpdateDecorations(document: vscode.TextDocument) {
  const isScss =
    document.languageId === 'scss' || isFileScss(document.fileName);
  if (!['css', 'scss'].includes(document.languageId)) {
    return;
  }
  const config = vscode.workspace.getConfiguration('betterStackingContexts');

  const decorationColor = config.get(
    'decorationColor',
    'editorInfo.foreground',
  );
  const messageText = config.get(
    'messageText',
    ' 🤐 This property creates a new stacking context',
  );

  try {
    const stackingContexts: StackingContext[] = await findStackingContexts(
      document.getText(),
      isScss,
    );
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
  } catch (error) {
    Logger.error(`Failed to update decorations: ${error}`);
  }
}
