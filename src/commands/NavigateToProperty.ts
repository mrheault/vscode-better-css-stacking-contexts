import * as vscode from 'vscode';
import { Logger } from '../helpers/logger';

export class NavigateToPropertyCommand {
  async execute(
    documentUri: vscode.Uri,
    range: {
      start: { line: { line: number }; character: { column: number } };
      end: { line: { line: number }; character: { column: number } };
    },
  ) {
    Logger.info(
      'navigateToProperty called with: ' +
        documentUri.toString() +
        ' ' +
        JSON.stringify(range),
    );

    let editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.toString() === documentUri.toString(),
    );

    if (!editor) {
      const document = await vscode.workspace.openTextDocument(documentUri);
      editor = await vscode.window.showTextDocument(document);
    } else {
      await vscode.window.showTextDocument(editor.document, editor.viewColumn);
    }

    const startLine = range.start.line.line;
    const startCharacter = range.start.character.column;
    const endLine = range.end.line.line;
    const endCharacter = range.end.character.column;

    const startPosition = new vscode.Position(
      Math.max(0, Math.min(startLine, editor.document.lineCount - 1)),
      Math.max(
        0,
        Math.min(startCharacter, editor.document.lineAt(startLine).text.length),
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
      vscode.TextEditorRevealType.InCenter,
    );
    editor.selection = new vscode.Selection(startPosition, startPosition);
  }
}
