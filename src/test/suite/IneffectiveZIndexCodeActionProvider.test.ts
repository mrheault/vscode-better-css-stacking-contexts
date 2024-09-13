import * as assert from "assert";
import * as vscode from "vscode";
import { INEFFECTIVE_Z_INDEX_CODE } from "../../contants/globals";
import { IneffectiveZIndexCodeActionProvider } from "../../providers/IneffectiveZIndexCodeActionProvider";

suite("IneffectiveZIndexCodeActionProvider Tests", () => {
  test("should provide code actions for ineffective z-index diagnostics", async () => {
    const provider = new IneffectiveZIndexCodeActionProvider();
    const document = await vscode.workspace.openTextDocument({
      content: "div { z-index: 1; }",
      language: "css",
    });
    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 15),
    );
    const diagnostic = new vscode.Diagnostic(
      range,
      "Ineffective z-index",
      vscode.DiagnosticSeverity.Warning,
    );
    diagnostic.code = INEFFECTIVE_Z_INDEX_CODE;
    const context: vscode.CodeActionContext = {
      diagnostics: [diagnostic],
      triggerKind: vscode.CodeActionTriggerKind.Invoke,
      only: undefined,
    };
    const actions = provider.provideCodeActions(
      document,
      range,
      context,
      new vscode.CancellationTokenSource().token,
    );

    assert.ok(actions);
    assert.strictEqual(actions?.length, 2);
  });
});
