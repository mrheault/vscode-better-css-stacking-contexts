import * as assert from "assert";
import * as vscode from "vscode";
import { StackingContextItem } from "../../providers/StackingContextItem";
import { StackingContext } from "../../types/StackingContext";

suite("StackingContextItem Tests", () => {
  test("should create a StackingContextItem with correct properties", () => {
    const context: StackingContext = {
      relatedProperty: "",
      property: "z-index",
      value: "1",
      selector: ".test",
      propertyRange: new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 1),
      ),
      ruleRange: new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 1),
      ),
    };
    const item = new StackingContextItem(
      "Test Label",
      context,
      vscode.Uri.parse("file:///test.css"),
    );

    assert.strictEqual(item.label, "Test Label");
    assert.strictEqual(item.context, context);
    assert.strictEqual(item.documentUri?.toString(), "file:///test.css");
    assert.strictEqual(item.tooltip, "Test Label - z-index: 1");
    assert.strictEqual(item.description, "z-index: 1; ");
  });
});
