import * as vscode from 'vscode';
import dedent from 'dedent';
import postcss from 'postcss';
import scssSyntax from 'postcss-scss';
import { Uri } from 'vscode';
import {
  diagnosticsCollection,
  INEFFECTIVE_Z_INDEX_CODE,
} from '../contants/globals';
import { isIneffectiveZIndexDeclaration } from '../helpers/findStackingContexts';
import { nodeRange } from '../helpers/nodeRange';
import { Logger } from '../helpers/logger';

export class ZIndexDiagnosticsProvider {
  constructor() {
    this.listenForDocumentChanges();
  }

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

  private listenForDocumentChanges(): void {
    vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        // Clear diagnostics for the edited document
        diagnosticsCollection.delete(event.document.uri);
      },
    );
  }

  private addDiagnostic(
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
