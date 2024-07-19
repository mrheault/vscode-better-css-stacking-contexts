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

  constructor(private stackingContexts: any[]) {}

  getTreeItem(element: StackingContextItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: StackingContextItem): Thenable<StackingContextItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(
        this.stackingContexts.map(
          (context, index) =>
            new StackingContextItem(
              `Context ${index + 1}: ${context.selector}`,
              context,
            ),
        ),
      );
    }
  }

  refresh(stackingContexts: any[]): void {
    this.stackingContexts = stackingContexts;
    this._onDidChangeTreeData.fire();
  }
}
