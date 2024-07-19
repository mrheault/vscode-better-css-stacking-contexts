import * as vscode from 'vscode';
import { Logger } from '../helpers/logger';
import { StackingContext } from '../types/StackingContext';

export class NavigateToPropertyCommand {
  async execute(documentUri: vscode.Uri, context: StackingContext) {
    try {
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

      const startLine = context.start.line;
      const startCharacter = context.start.column;
      const endLine = context.end.line;
      const endCharacter = context.end.column;

      const startPosition = new vscode.Position(
        Math.max(0, Math.min(startLine, editor.document.lineCount - 1)),
        Math.max(
          0,
          Math.min(
            startCharacter,
            editor.document.lineAt(startLine).text.length,
          ),
        ),
      );
      const endPosition = new vscode.Position(
        Math.max(0, Math.min(endLine, editor.document.lineCount - 1)),
        Math.max(
          0,
          Math.min(endCharacter, editor.document.lineAt(endLine).text.length),
        ),
      );

      editor.selection = new vscode.Selection(startPosition, startPosition);
      editor.revealRange(
        new vscode.Range(startPosition, endPosition),
        vscode.TextEditorRevealType.AtTop,
      );
      editor.selection = new vscode.Selection(startPosition, startPosition);
    } catch (e) {
      Logger.error(`Failed to navigate to property: ${(e as Error).message}`);
      vscode.window.showErrorMessage('Failed to navigate to the CSS property.');
    }
  }
}
