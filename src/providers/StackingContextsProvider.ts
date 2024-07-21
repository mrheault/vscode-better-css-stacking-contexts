import * as vscode from 'vscode';
import { Logger } from '../helpers/logger';
import { StackingContext } from '../types/StackingContext';
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
    private stackingContexts: StackingContext[] = [],
    private documentUri?: vscode.Uri,
  ) {}

  getTreeItem(element: StackingContextItem): vscode.TreeItem {
    return element;
  }

  async getChildren(
    element?: StackingContextItem,
  ): Promise<StackingContextItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      if (!this.documentUri) {
        Logger.warning('Document URI is undefined in StackingContextsProvider');
        return Promise.resolve([]);
      }
      try {
        return this.stackingContexts.map((context, index) => {
          return new StackingContextItem(
            `Context ${index + 1}: ${context.selector}`,
            context,
            this.documentUri,
          );
        });
      } catch (error: any) {
        Logger.error(
          `Error in getChildren method of StackingContextsProvider: ${error.message}`,
        );
        return [];
      }
    }
  }

  refresh(stackingContexts: any[], documentUri: vscode.Uri): void {
    this.stackingContexts = stackingContexts;
    this.documentUri = documentUri;
    this._onDidChangeTreeData.fire();
  }
}
