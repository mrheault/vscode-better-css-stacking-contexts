import postcss, { Node, Declaration } from 'postcss';
import scssSyntax from 'postcss-scss';
export const isDeclaration = (node: Node): node is Declaration =>
  node.type === 'decl';
const globalNeutralValues = new Set<string>([
  'unset',
  'initial',
  'inherit',
  'revert',
]);
const stackingProperties = new Set<string>([
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

function isStackingContextCreatingValue(node: Declaration): boolean {
  if (node.prop === 'opacity') {
    return parseFloat(node.value) < 1;
  }
  if (nonNoneValues.has(node.prop)) {
    return node.value.trim().toLowerCase() !== 'none';
  }
  if (node.prop === 'mix-blend-mode') {
    return node.value.trim().toLowerCase() !== 'normal';
  }
  return stackingProperties.has(`${node.prop}: ${node.value}`);
}

export async function findStackingContexts(
  content: string,
  isScss: boolean = false,
): Promise<{ start: number; end: number }[]> {
  const stackingContexts: { start: number; end: number; selector: string }[] =
    [];
  const syntax = isScss ? scssSyntax : undefined;
  const result = await postcss().process(content, { syntax: syntax });

  result.root?.walkRules((rule) => {
    const hasStackingContext = rule.nodes?.some(
      (node: any) =>
        isDeclaration(node) && isStackingContextCreatingValue(node),
    );
    if (hasStackingContext && rule.source?.start && rule.source.end) {
      stackingContexts.push({
        start: rule.source.start.offset,
        end: rule.source.end.offset,
        selector: rule.selector,
      });
    }
  });

  return stackingContexts;
}

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
