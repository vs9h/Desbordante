import { atom } from 'jotai';
import { MFDSortBy, OrderDirection, Pagination } from 'types/globalTypes';

export type MFDHighlight = {
  index: number;
  rowIndex: number;
  withinLimit: boolean;
  maximumDistance: string;
  furthestPointIndex: number;
  value: string;
  clusterValue: string;
};

export type MFDCluster = {
  value: string;
  highlightsTotalCount: number;
  highlights: MFDHighlight[];
};

type MFDTaskAtom = {
  taskID: string;
  result: boolean | undefined;
  clustersTotalCount: number;
  clusterIndex: number;
  cluster: MFDCluster;
  pagination: Pagination;
  sortBy: MFDSortBy;
  orderDirection: OrderDirection;
};

export const MFDAtomDefaultValues: MFDTaskAtom = {
  // general task data
  taskID: '',
  result: undefined,
  clustersTotalCount: 0,
  // current cluster data
  clusterIndex: 0,
  cluster: {
    value: '',
    highlightsTotalCount: 0,
    highlights: [],
  },
  pagination: {
    offset: 0,
    limit: 0,
  },
  sortBy: MFDSortBy.MAXIMUM_DISTANCE,
  orderDirection: OrderDirection.ASC,
};

export const MFDAtomDefaultValuesWithParams = (
  taskID: string,
  clusterIndex = 0,
  limit = 0,
  sortBy = MFDSortBy.MAXIMUM_DISTANCE,
  orderDirection = OrderDirection.ASC
) => ({
  ...MFDAtomDefaultValues,
  taskID,
  clusterIndex,
  pagination: {
    offset: 0,
    limit,
  },
  sortBy,
  orderDirection,
});

const MFDAtom = atom<MFDTaskAtom>(MFDAtomDefaultValues);

export default MFDAtom;
