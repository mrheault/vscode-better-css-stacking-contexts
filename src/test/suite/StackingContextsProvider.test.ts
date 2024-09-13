import * as assert from "assert";
import * as vscode from "vscode";
import { StackingContextsProvider } from "../../providers/StackingContextsProvider";
import { StackingContext } from "../../types/StackingContext";

suite("StackingContextsProvider Tests", () => {
  test("should get children of a tree item", async () => {
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
    const provider = new StackingContextsProvider(
      [context],
      vscode.Uri.parse("file:///test.css"),
    );
    const children = await provider.getChildren();

    assert.strictEqual(children.length, 1);
    assert.strictEqual(children[0].label, "Context 1: .test");
  });
});
