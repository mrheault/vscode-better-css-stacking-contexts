import { Position } from 'postcss';
import { Range } from 'vscode';
export type StackingContext = {
  start: Position;
  end: Position;
  selector: string;
  ruleRange: Range;
  property: string;
  value: string;
  relatedProperty?: string;
};
