import { Position } from 'postcss';

export type StackingContext = {
  start: Position;
  end: Position;
  selector: string;
  property: string;
  value: string;
};
