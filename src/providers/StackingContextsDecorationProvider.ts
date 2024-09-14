import * as vscode from "vscode";
import dedent from "dedent";
import { findStackingContexts } from "../helpers/findStackingContexts";
import { Logger } from "../helpers/logger";

export class StackingContextDecorationProvider {
  private propertyDecorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({});
  private ruleHighlightDecorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType({});
  private readonly cache: any;

  constructor(cache: any) {
    this.cache = cache;
    this.updateConfigValues();
  }

  public updateConfigValues(): void {
    const decorationColor =
      this.getConfigValue<string>("decorationColor") || "editorInfo.foreground";
    const ruleBackgroundColor =
      this.getConfigValue<string>("backgroundColor") ||
      "editor.hoverHighlightBackground";
    const messageText =
      this.getConfigValue<string>("messageText") ||
      " 🤐 This property creates a new stacking context";

    // Dispose of old decoration types if they exist
    if (this.propertyDecorationType) {
      this.propertyDecorationType.dispose();
    }
    if (this.ruleHighlightDecorationType) {
      this.ruleHighlightDecorationType.dispose();
    }

    this.propertyDecorationType = vscode.window.createTextEditorDecorationType({
      after: {
        color: this.getColor(decorationColor),
        contentText: messageText,
      },
      isWholeLine: true,
    });

    this.ruleHighlightDecorationType =
      vscode.window.createTextEditorDecorationType({
        backgroundColor: this.getColor(ruleBackgroundColor),
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
        isWholeLine: true,
      });
  }

  private getConfigValue<T>(key: string): T | undefined {
    return vscode.workspace
      .getConfiguration("betterStackingContexts")
      .get<T>(key);
  }

  private getColor(colorId: string): string | vscode.ThemeColor {
    return colorId.startsWith("#") ? colorId : new vscode.ThemeColor(colorId);
  }

  public async updateDecorations(document: vscode.TextDocument): Promise<void> {
    if (!["css", "scss"].includes(document.languageId)) {
      return;
    }
    try {
      const stackingContexts = await findStackingContexts(
        document.getText(),
        document.languageId === "scss",
      );
      const propertyRanges = stackingContexts.map(
        (context) => context.propertyRange,
      );
      const ruleRanges = stackingContexts.map((context) => context.ruleRange);
      const hoverMessage = new vscode.MarkdownString(
        dedent`
          This property introduces a new stacking context.
          This means all \`z-index\` declarations for descendants of this element will be
          independent of \`z-index\` declarations for other elements on the page.

          [MDN Ref](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
        `,
      );
      hoverMessage.isTrusted = true;

      const propertyDecorationOptions = propertyRanges.map((range) => ({
        range: range,
        hoverMessage: hoverMessage,
      }));
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.uri === document.uri) {
        activeEditor.setDecorations(
          this.propertyDecorationType,
          propertyDecorationOptions,
        );
        activeEditor.setDecorations(
          this.ruleHighlightDecorationType,
          ruleRanges,
        );
      }
    } catch (e) {
      Logger.error(`Error in updateDecorations: ${e}`);
    }
  }
}
