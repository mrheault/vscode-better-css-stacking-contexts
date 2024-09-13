import * as vscode from "vscode";
import dedent from "dedent";
import postcss from "postcss";
import scssSyntax from "postcss-scss";
import { Uri } from "vscode";
import {
  diagnosticsCollection,
  INEFFECTIVE_Z_INDEX_CODE,
} from "../contants/globals";
import { isIneffectiveZIndexDeclaration } from "../helpers/findStackingContexts";
import { nodeRange } from "../helpers/nodeRange";
import { Logger } from "../helpers/logger";
import debounce from "lodash.debounce";

export class ZIndexDiagnosticsProvider {
  private cache: Map<string, vscode.Diagnostic[]> = new Map();

  constructor() {
    this.listenForDocumentChanges();
  }

  public async provideZIndexDiagnostic(
    document: vscode.TextDocument,
  ): Promise<void> {
    try {
      const text = document.getText();
      const result = await postcss().process(text, {
        syntax: document.languageId === "scss" ? scssSyntax : undefined,
      });

      const diagnostics: vscode.Diagnostic[] = [];
      result.root.walkDecls("z-index", (decl) => {
        const isIneffective = isIneffectiveZIndexDeclaration(decl);

        if (isIneffective) {
          const range = nodeRange(decl);
          const diagnostic = new vscode.Diagnostic(
            range,
            dedent`The \`z-index\` value of ${decl.value} is ineffective because the rule does not create a new stacking context.`,
            vscode.DiagnosticSeverity.Warning,
          );
          diagnostic.code = INEFFECTIVE_Z_INDEX_CODE;
          diagnostics.push(diagnostic);
        }
      });

      this.cache.set(document.uri.toString(), diagnostics);
      diagnosticsCollection.set(document.uri, diagnostics);
    } catch (e) {
      Logger.error(`Error in provideZIndexDiagnostic: ${e}`);
    }
  }

  private listenForDocumentChanges(): void {
    const debouncedUpdate = debounce(
      (document: vscode.TextDocument) => this.provideZIndexDiagnostic(document),
      300,
    );

    vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        diagnosticsCollection.delete(event.document.uri);
        debouncedUpdate(event.document);
      },
    );
  }
}
