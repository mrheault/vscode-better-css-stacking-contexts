import * as assert from "assert";
import * as vscode from "vscode";
import { ZIndexDiagnosticsProvider } from "../../providers/ZIndexDiagnosticsProvider";

suite("ZIndexDiagnosticsProvider Tests", () => {
  test("should provide no diagnostic for valid z-index with stacking context", async () => {
    const provider = new ZIndexDiagnosticsProvider();
    const document = await vscode.workspace.openTextDocument({
      content: "div { position: relative; z-index: 1; }",
      language: "css",
    });

    await provider.provideZIndexDiagnostic(document);

    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics.length, 0);
  });

  test("should provide diagnostic for z-index without stacking context", async () => {
    const provider = new ZIndexDiagnosticsProvider();
    const document = await vscode.workspace.openTextDocument({
      content: "div { z-index: 1; }",
      language: "css",
    });

    await provider.provideZIndexDiagnostic(document);

    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(
      diagnostics[0].message,
      "The `z-index` value of 1 is ineffective because the rule does not create a new stacking context.",
    );
  });

  test("should provide multiple diagnostics for multiple ineffective z-indexes", async () => {
    const provider = new ZIndexDiagnosticsProvider();
    const document = await vscode.workspace.openTextDocument({
      content: "div { z-index: 1; } span { z-index: 2; }",
      language: "css",
    });

    await provider.provideZIndexDiagnostic(document);

    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    assert.strictEqual(diagnostics.length, 2);
    assert.strictEqual(
      diagnostics[0].message,
      "The `z-index` value of 1 is ineffective because the rule does not create a new stacking context.",
    );
    assert.strictEqual(
      diagnostics[1].message,
      "The `z-index` value of 2 is ineffective because the rule does not create a new stacking context.",
    );
  });
});
