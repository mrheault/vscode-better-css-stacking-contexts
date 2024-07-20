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
      const ranges = new vscode.Range(
        editor.document.positionAt(context.start.offset),
        editor.document.positionAt(context.end.offset),
      );

      editor.revealRange(ranges, vscode.TextEditorRevealType.InCenter);
      editor.selection = new vscode.Selection(ranges.start, ranges.start);
    } catch (e) {
      Logger.error(`Failed to navigate to property: ${(e as Error).message}`);
      vscode.window.showErrorMessage('Failed to navigate to the CSS property.');
    }
  }
}
