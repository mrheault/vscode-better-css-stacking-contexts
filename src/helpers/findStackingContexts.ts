import postcss from 'postcss';
import scssSyntax from 'postcss-scss';

const stackingProperties = [
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
];

function isStackingContextCreatingValue(
  property: string,
  value: string,
): boolean {
  const nonNoneValues = [
    'transform',
    'filter',
    'perspective',
    'clip-path',
    'mask',
    'mask-image',
    'mask-border',
  ];
  if (property === 'opacity') {
    return parseFloat(value) < 1;
  }
  if (nonNoneValues.includes(property)) {
    return value.trim().toLowerCase() !== 'none';
  }
  if (property === 'mix-blend-mode') {
    return value.trim().toLowerCase() !== 'normal';
  }
  return stackingProperties.includes(`${property}: ${value}`);
}

export async function findStackingContexts(
  content: string,
  isScss: boolean = false,
): Promise<{ start: number; end: number }[]> {
  const stackingContexts: { start: number; end: number }[] = [];
  const syntax = isScss ? scssSyntax : undefined;
  const result = await postcss().process(content, { syntax: syntax });

  result.root?.walkRules((rule) => {
    const hasStackingContext = rule.nodes?.some(
      (node: any) =>
        node.type === 'decl' &&
        isStackingContextCreatingValue(node.prop, node.value),
    );
    if (hasStackingContext && rule.source?.start && rule.source.end) {
      stackingContexts.push({
        start: rule.source.start.offset,
        end: rule.source.end.offset,
      });
    }
  });

  return stackingContexts;
}
