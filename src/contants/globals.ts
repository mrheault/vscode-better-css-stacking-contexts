import * as vscode from 'vscode';

/**
 * Document selector
 */
export const DOCUMENT_SELECTOR: vscode.DocumentSelector = [
  { language: 'scss' },
  { language: 'css' },
];

/**
 * Code for ineffective z-index
 */
export const INEFFECTIVE_Z_INDEX_CODE = 'ineffective-z-index';

/**
 * Collection of diagnostics
 */
export const diagnosticsCollection =
  vscode.languages.createDiagnosticCollection('better-stacking-contexts');
