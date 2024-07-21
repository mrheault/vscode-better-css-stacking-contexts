import * as vscode from 'vscode';
import { Logger } from '../helpers/logger';
import { StackingContext } from '../types/StackingContext';
import { StackingContextItem } from './StackingContextItem';

/**
 * Provider for Stacking Contexts tree view
 */
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

  /**
   * Get the tree item
   * @param element
   */
  getTreeItem(element: StackingContextItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children of a tree item
   * @param element
   */
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

  /**
   * Refresh the tree view
   * @param stackingContexts
   * @param documentUri
   */
  refresh(stackingContexts: any[], documentUri: vscode.Uri): void {
    this.stackingContexts = stackingContexts;
    this.documentUri = documentUri;
    this._onDidChangeTreeData.fire();
  }
}
