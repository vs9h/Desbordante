import _ from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OrderingTitles } from '@constants/titles';
import {
  FDSortBy,
  CFDSortBy,
  ARSortBy,
  OrderBy,
  PrimitiveType,
  AFDSortRowsBy,
  AFDSortBy,
} from 'types/globalTypes';

export type Sorting =
  | FDSortBy
  | CFDSortBy
  | ARSortBy
  | AFDSortBy
  | AFDSortRowsBy;

export type FiltersFields = {
  ordering: Sorting;
  direction: OrderBy;
  search: string;
  page: number;
  mustContainRhsColIndices: string;
  mustContainLhsColIndices: string;
  showKeys: boolean;
  rowsOrdering: Sorting;
  showOnlyLRHS: boolean;
};

const getDefaultOrdering: (primitive: PrimitiveType) => Sorting = (primitive) =>
  _.keys(OrderingTitles[primitive])[0] as Sorting;

export const useFilters = (primitive: PrimitiveType) => {
  const methods = useForm<FiltersFields, keyof FiltersFields>({
    defaultValues: {
      page: 1,
      ordering: getDefaultOrdering(primitive),
      direction: OrderBy.ASC,
      search: '',
      mustContainRhsColIndices: '',
      mustContainLhsColIndices: '',
      showKeys: false,
      rowsOrdering: AFDSortRowsBy.ROW_INDEX,
      showOnlyLRHS: false,
    },
  });

  useEffect(
    () => methods.setValue('ordering', getDefaultOrdering(primitive)),
    [primitive],
  );

  return methods;
};

export const getSortingParams = (primitive: PrimitiveType) => {
  return {
    [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
    'SortBy']: _.keys(OrderingTitles[primitive])[0],
  };
};
