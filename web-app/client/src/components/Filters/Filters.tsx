import _ from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OrderingTitles } from '@constants/titles';
import {
  FDSortBy,
  CFDSortBy,
  ARSortBy,
  OrderDirection,
  PrimitiveType,
} from 'types/globalTypes';

export type Sorting = FDSortBy | CFDSortBy | ARSortBy;

export type FiltersFields = {
  ordering: Sorting;
  direction: OrderDirection;
  search: string;
  page: number;
  mustContainRhsColIndices: string;
  mustContainLhsColIndices: string;
  showKeys: boolean;
};

const getDefaultOrdering: (primitive: PrimitiveType) => Sorting = (primitive) =>
  _.keys(OrderingTitles[primitive])[0] as Sorting;

export const useFilters = (primitive: PrimitiveType) => {
  const methods = useForm<FiltersFields, keyof FiltersFields>({
    defaultValues: {
      page: 1,
      ordering: getDefaultOrdering(primitive),
      direction: OrderDirection.ASC,
      search: '',
      mustContainRhsColIndices: '',
      mustContainLhsColIndices: '',
      showKeys: false,
    },
  });

  useEffect(
    () => methods.setValue('ordering', getDefaultOrdering(primitive)),
    [primitive]
  );

  return methods;
};

export const getSortingParams = (primitive: PrimitiveType) => {
  return {
    [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
    'SortBy']: _.keys(OrderingTitles[primitive])[0],
  };
};
