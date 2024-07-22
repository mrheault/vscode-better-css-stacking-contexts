import postcss, { Declaration } from 'postcss';
import scssSyntax from 'postcss-scss';
import { isDeclaration } from '../contants/globals';
import { StackingContext } from '../types/StackingContext';
import { Logger } from './logger';

const globalNeutralValues = new Set(['unset', 'initial', 'inherit', 'revert']);
const stackingProperties = new Set([
  'position: fixed',
  'position: sticky',
  'position: absolute',
  'opacity',
  'transform',
  'filter',
  'perspective',
  'clip-path',
  'mask',
  'mask-image',
  'mask-border',
  'isolation: isolate',
  'mix-blend-mode',
  '-webkit-overflow-scrolling: touch',
  'will-change',
  'contain: layout',
  'contain: paint',
  'contain: content',
]);

const nonNoneValues = new Set([
  'transform',
  'filter',
  'perspective',
  'clip-path',
  'mask',
  'mask-image',
  'mask-border',
]);

/**
 * Check if a declaration creates a stacking context
 * @param node
 */
function isStackingContextCreatingValue(node: Declaration): boolean {
  const value = node.value.trim().toLowerCase();
  const propValueCombo = `${node.prop}: ${value}`;
  if (
    ['rotate', 'translate', 'scale'].includes(node.prop) &&
    value !== 'none'
  ) {
    return true;
  }
  if (node.prop === 'opacity' && parseFloat(value) < 1) {
    return true;
  }
  if (node.prop === 'mix-blend-mode' && value !== 'normal') {
    return true;
  }
  if (nonNoneValues.has(node.prop) && value !== 'none') {
    return true;
  }

  if (
    [
      'position: absolute',
      'position: relative',
      'position: fixed',
      'position: sticky',
    ].includes(propValueCombo) &&
    node.parent
  ) {
    const zIndexValue = (
      node.parent.nodes.find(
        (n) => isDeclaration(n) && n.prop === 'z-index',
      ) as Declaration | undefined
    )?.value;
    if (zIndexValue && zIndexValue !== 'auto') {
      return true;
    }
  }

  if (node.prop === 'will-change') {
    return value.split(',').some((prop) => stackingProperties.has(prop.trim()));
  }

  if (
    node.prop === 'contain' &&
    ['layout', 'paint', 'content'].includes(value)
  ) {
    return true;
  }

  if (
    node.prop === 'display' &&
    ['flex', 'grid'].includes(value) &&
    node.parent
  ) {
    const zIndexValue = (
      node.parent.nodes.find(
        (n) => isDeclaration(n) && n.prop === 'z-index',
      ) as Declaration | undefined
    )?.value;
    if (zIndexValue && zIndexValue !== 'auto') {
      return true;
    }
  }

  return stackingProperties.has(propValueCombo);
}

/**
 * Find a second property needed for a stacking context creating property
 * @param node
 */
function findRelatedProperty(node: any) {
  let relatedProperty: string | undefined;
  const propValueCombo = `${node.prop}: ${node.value.trim().toLowerCase()}`;

  if (
    [
      'position: absolute',
      'position: relative',
      'position: fixed',
      'position: sticky',
    ].includes(propValueCombo) ||
    (node.prop === 'display' &&
      ['flex', 'grid'].includes(node.value.trim().toLowerCase()))
  ) {
    const zIndexNode = node.parent?.nodes.find(
      (n: postcss.Node) => isDeclaration(n) && n.prop === 'z-index',
    ) as Declaration | undefined;
    if (zIndexNode) {
      relatedProperty = `${zIndexNode.prop}: ${zIndexNode.value}`;
    }
  }

  return relatedProperty;
}

/**
 * Find stacking contexts in CSS/SCSS
 * @param content
 * @param isScss
 */
export async function findStackingContexts(
  content: string,
  isScss: boolean = false,
): Promise<StackingContext[]> {
  const stackingContexts: StackingContext[] = [];
  const syntax = isScss ? scssSyntax : undefined;

  try {
    const result = await postcss().process(content, {
      syntax,
      from: undefined,
    });

    result.root?.walkRules((rule) => {
      rule.nodes?.forEach((node: any) => {
        if (isDeclaration(node) && isStackingContextCreatingValue(node)) {
          let relatedProperty = findRelatedProperty(node);

          if (node.source?.start && node.source.end) {
            stackingContexts.push({
              start: node.source.start,
              end: node.source.end,
              selector: rule.selector,
              property: node.prop,
              value: node.value,
              relatedProperty,
            });
          }
        }
      });
    });
  } catch (e) {
    Logger.error(`Error processing CSS/SCSS: ${e}`);
  }

  return stackingContexts;
}

/**
 * Check if a declaration is an ineffective z-index declaration
 * @param declaration
 */
export function isIneffectiveZIndexDeclaration(
  declaration: Declaration,
): boolean {
  return (
    declaration.prop === 'z-index' &&
    declaration.value !== 'auto' &&
    !globalNeutralValues.has(declaration.value) &&
    !declaration.parent?.some(
      (node) => isDeclaration(node) && isStackingContextCreatingValue(node),
    )
  );
}
