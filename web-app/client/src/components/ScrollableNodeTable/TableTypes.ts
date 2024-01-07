import { ReactNode } from 'react';

export type Row = {
  items: ReactNode[];
  globalIndex: number | string;
  style?: string;
};

export type ScrollDirection = 'up' | 'down';

export type TableProps = {
  containerKey?: number | string;
  data: Row[];
  header?: string[];
  highlightRowIndices?: number[];
  highlightColumnIndices?: number[];
  hiddenColumnIndices?: number[];
  onScroll?: (direction: ScrollDirection) => void;
  className?: string;
  alternateRowColors?: boolean;
};
