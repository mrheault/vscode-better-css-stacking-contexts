import { Node, Position } from 'postcss';
import * as vscode from 'vscode';

/**
 * Convert a postcss Position to a vscode Position
 * @param position
 */
export const convertPosition = (position: Position): vscode.Position => {
  return new vscode.Position(position.line - 1, position.column - 1);
};

/**
 * Get the range of a node
 * @param node
 */
export const nodeRange = (node: Node): vscode.Range => {
  if (!node.source?.start || !node.source.end) {
    throw new Error('Node has no source position');
  }
  return new vscode.Range(
    convertPosition(node.source.start),
    convertPosition(node.source.end),
  );
};
