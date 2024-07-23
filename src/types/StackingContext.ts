import { Position } from 'postcss';
import { Range } from 'vscode';
export type StackingContext = {
  propertyRange: Range;
  selector: string;
  ruleRange: Range;
  property: string;
  value: string;
  relatedProperty?: string;
};
