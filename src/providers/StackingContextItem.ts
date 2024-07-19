import * as vscode from 'vscode';

export class StackingContextItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly context: any,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `${this.label}`;
    this.description = this.label;
  }
}
