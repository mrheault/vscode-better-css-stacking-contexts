import vscode from 'vscode';
import { findStackingContexts } from './findStackingContexts';
import { Logger } from './logger';

export async function getOrFetchStackingContexts(
  document: vscode.TextDocument,
  cache: any,
): Promise<any[]> {
  const cacheKey = document.uri.toString();
  let stackingContexts = cache.get(cacheKey);
  if (!stackingContexts) {
    try {
      stackingContexts = await findStackingContexts(
        document.getText(),
        document.languageId === 'scss',
      );
      await cache.put(cacheKey, stackingContexts);
    } catch (e) {
      Logger.error(
        `Failed to fetch stacking contexts: ${(e as Error).message}`,
      );
      stackingContexts = [];
    }
  }
  return stackingContexts;
}
