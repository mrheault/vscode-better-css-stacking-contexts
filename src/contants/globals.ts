import * as vscode from 'vscode';
export const DOCUMENT_SELECTOR: vscode.DocumentSelector = [
  { language: 'scss' },
  { language: 'css' },
];
export const INEFFECTIVE_Z_INDEX_CODE = 'ineffective-z-index';

export const diagnosticsCollection =
  vscode.languages.createDiagnosticCollection('better-stacking-contexts');
