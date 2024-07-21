import dedent from 'dedent';
import postcss from 'postcss';
import scssSyntax from 'postcss-scss';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import {
  diagnosticsCollection,
  INEFFECTIVE_Z_INDEX_CODE,
} from '../contants/globals';

import {
  findStackingContexts,
  isIneffectiveZIndexDeclaration,
} from '../helpers/findStackingContexts';
import { Logger } from '../helpers/logger';
import { nodeRange } from '../helpers/nodeRange';

/**
 * Provider for stacking contexts and z-index diagnostics
 */
export class StackingContextsAndZIndexProvider {
  private readonly decorationType: vscode.TextEditorDecorationType;
  private readonly cache: any;

  constructor(cache: any) {
    this.cache = cache;
    this.listenForDocumentChanges();

    this.decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        color: new vscode.ThemeColor('editorInfo.foreground'),
        contentText: ' 🤐 This property creates a new stacking context',
      },
      isWholeLine: true,
    });
  }

  /**
   * Provide diagnostics for the z-index property
   * @param document
   */
  public async provideZIndexDiagnostic(
    document: vscode.TextDocument,
  ): Promise<void> {
    try {
      const text = document.getText();
      const result = await postcss().process(text, {
        syntax: document.languageId === 'scss' ? scssSyntax : undefined,
      });

      result.root.walkDecls('z-index', (decl) => {
        if (isIneffectiveZIndexDeclaration(decl)) {
          const range = nodeRange(decl);
          this.addDiagnostic(
            document,
            range,
            dedent`The \`z-index\` value of ${decl.value} is ineffective in this context because the rule does not create a new stacking context.`,
            vscode.DiagnosticSeverity.Warning,
            INEFFECTIVE_Z_INDEX_CODE,
          );
        }
      });
    } catch (e) {
      Logger.error(`Error in provideZIndexDiagnostic: ${e}`);
    }
  }

  /**
   * Update the decorations for the active editor
   * @param document
   */
  public async updateDecorations(document: vscode.TextDocument): Promise<void> {
    const stackingContexts = await findStackingContexts(
      document.getText(),
      document.languageId === 'scss',
    );
    const ranges = stackingContexts.map(
      (context) =>
        new vscode.Range(
          document.positionAt(context.start.offset),
          document.positionAt(context.end.offset),
        ),
    );
    const hoverMessage = new vscode.MarkdownString(
      dedent`
            This property introduces a new stacking context.
            This means all \`z-index\` declarations for descendants of this element will be
            independent of \`z-index\` declarations for other elements on the page.

            [MDN Ref](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
        `,
    );
    hoverMessage.isTrusted = true;

    const decorationOptions = ranges.map((range) => ({
      range: range,
      hoverMessage: hoverMessage,
    }));
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri === document.uri) {
      activeEditor.setDecorations(this.decorationType, decorationOptions);
    }
  }

  /**
   * Listen for document changes
   * @private
   */
  private listenForDocumentChanges(): void {
    vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        // Clear diagnostics for the edited document
        diagnosticsCollection.delete(event.document.uri);
      },
    );
  }

  /**
   * Add a diagnostic to the diagnostics collection
   * @param document
   * @param range
   * @param message
   * @param severity
   * @param code
   * @param tags
   */
  public async addDiagnostic(
    document: vscode.TextDocument,
    range: vscode.Range,
    message: string,
    severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Warning,
    code: string | number | { value: string | number; target: Uri },
    tags: vscode.DiagnosticTag[] = [],
  ) {
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.source = 'better-stacking-contexts';
    diagnostic.code = code;
    diagnostic.tags = tags;
    diagnosticsCollection.set(document.uri, [diagnostic]);
  }
}
