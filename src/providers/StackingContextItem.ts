import * as vscode from 'vscode';
import { Logger } from '../helpers/logger';
import { StackingContext } from '../types/StackingContext';

/**
 * Stacking Contexts tree view item
 */
export class StackingContextItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly context: StackingContext,
    public readonly documentUri?: vscode.Uri,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    if (!this.documentUri || !this.context) {
      Logger.warning(
        'Document URI or Context is undefined in StackingContextItem',
      );
      this.tooltip = `Error: Missing context or documentUri`;
      this.description = `Error: Missing data`;
    } else {
      this.tooltip = `${this.label} - ${context.property}: ${context.value}`;
      this.description = `${context.property}: ${context.value}`;
      this.command = {
        title: 'Go To CSS Property',
        command: 'stackingContexts.navigateToProperty',
        arguments: [this.documentUri, this.context],
      };
    }
  }
}
