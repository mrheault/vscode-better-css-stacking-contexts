import vscode from 'vscode';
import { StackingContext } from '../types/StackingContext';
import { findStackingContexts } from './findStackingContexts';
import { Logger } from './logger';

export async function getSetStackingContexts(
  document: vscode.TextDocument,
  cache: any,
): Promise<any[]> {
  const cacheKey = document.uri.toString();
  let cacheEntry = cache.get(cacheKey);
  const documentLastModified = document.version; // Assuming 'version' increases with each modification

  // Check if cache exists and if document has been modified since last cache
  if (cacheEntry && cacheEntry.lastModified === documentLastModified) {
    // Cache is up-to-date, return the stored stacking contexts
    return cacheEntry.stackingContexts;
  } else {
    // Document modified or not in cache, fetch and update cache
    let stackingContexts: StackingContext[] = [];
    try {
      stackingContexts = await findStackingContexts(
        document.getText(),
        document.languageId === 'scss',
      );
      // Update cache with new stacking contexts and current document version
      await cache.put(cacheKey, {
        stackingContexts,
        lastModified: documentLastModified,
      });
    } catch (e) {
      Logger.error(
        `Failed to fetch stacking contexts: ${(e as Error).message}`,
      );
      // In case of error, ensure an empty array is returned
      stackingContexts = [];
    }
    return stackingContexts;
  }
}
