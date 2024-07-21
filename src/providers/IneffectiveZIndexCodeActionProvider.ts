import * as vscode from 'vscode';
import { INEFFECTIVE_Z_INDEX_CODE } from '../contants/globals';

/**
 * Code action provider for ineffective z-index diagnostics
 */
export class IneffectiveZIndexCodeActionProvider
  implements vscode.CodeActionProvider
{
  /**
   * Provide code actions for ineffective z-index diagnostics
   * @param document
   * @param range
   * @param context
   * @param token
   */
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken,
  ): vscode.CodeAction[] | undefined {
    const diagnostics = context.diagnostics.filter(
      (diagnostic) => diagnostic.code === INEFFECTIVE_Z_INDEX_CODE,
    );

    const actions = diagnostics
      .map((diagnostic) => [
        this.createRemoveFix(document, diagnostic.range),
        this.createAddStackingContextFix(document, diagnostic.range),
      ])
      .flat();

    return actions;
  }

  /**
   * Create a fix to remove the ineffective z-index declaration
   * @param document
   * @param range
   * @private
   */
  private createRemoveFix(
    document: vscode.TextDocument,
    range: vscode.Range,
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(
      'Remove ineffective z-index',
      vscode.CodeActionKind.QuickFix,
    );
    fix.edit = new vscode.WorkspaceEdit();

    const line = document.lineAt(range.end.line);
    const extendedRange = new vscode.Range(range.start, line.range.end);

    fix.edit.delete(document.uri, extendedRange);
    return fix;
  }

  /**
   * Create a fix to add a stacking context to the parent element
   * @param document
   * @param range
   * @private
   */
  private createAddStackingContextFix(
    document: vscode.TextDocument,
    range: vscode.Range,
  ): vscode.CodeAction {
    // Read the user's preferred method from the configuration
    const method = vscode.workspace
      .getConfiguration('betterStackingContexts')
      .get<string>('stackingContextMethod');
    // Construct the title string based on the user's preference
    const actionTitle =
      method === 'isolation'
        ? 'Add stacking context (isolation: isolate)'
        : 'Add stacking context (position: relative)';

    const fix = new vscode.CodeAction(
      actionTitle,
      vscode.CodeActionKind.QuickFix,
    );
    fix.edit = new vscode.WorkspaceEdit();

    // Fetch the current line to determine its indentation
    const currentLine = document.lineAt(range.start.line);
    const currentLineText = currentLine.text;
    const indentation = currentLineText.substring(
      0,
      currentLineText.search(/\S|$/),
    );

    // Determine the declaration based on the user's preference
    const declaration =
      method === 'isolation' ? 'isolation: isolate;' : 'position: relative;';
    const declarationWithIndentation = `${indentation}${declaration}`;
    const startPosition = new vscode.Position(range.start.line, 0);
    fix.edit.insert(
      document.uri,
      startPosition,
      `${declarationWithIndentation}\n`,
    );

    return fix;
  }
}
