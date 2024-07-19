import * as vscode from 'vscode';
import { StackingContextItem } from './StackingContextItem';

export class StackingContextsProvider
  implements vscode.TreeDataProvider<StackingContextItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    StackingContextItem | undefined | null | void
  > = new vscode.EventEmitter<StackingContextItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    StackingContextItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private stackingContexts: any[] = [],
    private documentUri?: vscode.Uri,
  ) {}

  getTreeItem(element: StackingContextItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: StackingContextItem): Thenable<StackingContextItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      if (!this.documentUri) {
        console.warn('Document URI is undefined in StackingContextsProvider');
        return Promise.resolve([]);
      }
      return Promise.resolve(
        this.stackingContexts.map((context, index) => {
          const range = new vscode.Range(
            new vscode.Position(context.start, context.start),
            new vscode.Position(context.end, context.end),
          );
          return new StackingContextItem(
            `Context ${index + 1}: ${context.selector}`,
            context,
            context.property,
            context.value,
            this.documentUri,
            range,
          );
        }),
      );
    }
  }

  refresh(stackingContexts: any[], documentUri: vscode.Uri): void {
    this.stackingContexts = stackingContexts;
    this.documentUri = documentUri;
    this._onDidChangeTreeData.fire();
  }
}