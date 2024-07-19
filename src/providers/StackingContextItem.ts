import * as vscode from 'vscode';

export class StackingContextItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly context: any,
    public readonly property?: string,
    public readonly value?: string,
    public readonly documentUri?: vscode.Uri,
    public readonly range?: vscode.Range,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `${this.label} - ${property}: ${value}`;
    this.description = `${property}: ${value}`;

    if (this.documentUri && this.range) {
      this.command = {
        title: 'Go To CSS Property',
        command: 'stackingContexts.navigateToProperty',
        arguments: [this.documentUri, this.range],
      };
    } else {
      console.warn('Document URI or Range is undefined in StackingContextItem');
    }
  }
}
