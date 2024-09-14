import * as assert from "assert";
import * as vscode from "vscode";
import { StackingContextDecorationProvider } from "../../providers/StackingContextsDecorationProvider";

suite("StackingContextDecorationProvider Tests", () => {
  test("should update decorations", async () => {
    const provider = new StackingContextDecorationProvider({});
    const document = await vscode.workspace.openTextDocument({
      content: "div { z-index: 1; }",
      language: "css",
    });
    await vscode.window.showTextDocument(document);
    await provider.updateDecorations(document);
    const activeEditor = vscode.window.activeTextEditor;
    assert.ok(activeEditor);
    assert.strictEqual(
      activeEditor?.document.uri.toString(),
      document.uri.toString(),
    );
  });
});
