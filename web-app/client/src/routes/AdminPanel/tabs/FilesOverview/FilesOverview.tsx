import { FC, useEffect, useState } from 'react';
import { Text } from '@components/Inputs';
import styles from './FilesOverview.module.scss';
import Button from '@components/Button';
import FilterIcon from '@assets/icons/filter.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import FiltersModal from './components/FiltersModal';
import { Moment } from 'moment';
import { FormProvider, useForm } from 'react-hook-form';
import {
  DatasetsQueryFilters,
  DatasetsQueryOrderingParameter,
  OrderDirection,
} from 'types/globalTypes';
import OrderingModal from './components/OrderingModal';
import { useLazyQuery } from '@apollo/client';
import DatasetItem from './components/DatasetItem';
import useFormPersist from '@hooks/useFormPersist';
import moment from 'moment';
import _ from 'lodash';
import { GET_DATASETS_INFO } from '@graphql/operations/queries/getDatasetsInfo';
import {
  getDatasetsInfo,
  getDatasetsInfoVariables,
} from '@graphql/operations/queries/__generated__/getDatasetsInfo';
import { useRouter } from 'next/router';

export type Filters = {
  searchString?: string;
  fileSize: [number | undefined, number | undefined];
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
  includeBuiltIn: boolean;
};

const defaultFilters: Filters = {
  searchString: undefined,
  fileSize: [undefined, undefined],
  period: [undefined, undefined],
  includeDeleted: false,
  includeBuiltIn: true,
};

export type Ordering = {
  parameter: DatasetsQueryOrderingParameter;
  direction: OrderDirection;
};

const defaultOrdering: Ordering = {
  parameter: DatasetsQueryOrderingParameter.CREATION_TIME,
  direction: OrderDirection.DESC,
};

const filtersToApi = (filters: Filters): DatasetsQueryFilters => ({
  ...filters,
  searchString: filters.searchString || undefined,
  fileSize: filters.fileSize.some(Boolean)
    ? {
        from: filters.fileSize[0] ?? undefined,
        to: filters.fileSize[1] ?? undefined,
      }
    : undefined,
  period: filters.period.some(Boolean)
    ? {
        from: filters.period[0]?.toISOString() ?? undefined,
        to: filters.period[1]?.toISOString() ?? undefined,
      }
    : undefined,
});

const FilesOverview: FC = () => {
  const router = useRouter();
  const filterMethods = useForm({ defaultValues: defaultFilters });
  const orderingMethods = useForm({ defaultValues: defaultOrdering });

  const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);
  const [isOrderingModalShown, setIsOrderingModalShown] = useState(false);

  useFormPersist(`${router.asPath}-filters`, {
    ...filterMethods,
    transformValues: {
      period: (value) => value.map((v: any) => (v ? moment(v) : undefined)),
      fileSize: (value) => value.map((v: any) => v ?? undefined),
    },
  });

  useFormPersist(`${router.asPath}-ordering`, {
    ...orderingMethods,
  });

  const [query, { data }] = useLazyQuery<
    getDatasetsInfo,
    getDatasetsInfoVariables
  >(GET_DATASETS_INFO);

  const doQuery = () => {
    query({
      variables: {
        props: {
          filters: filtersToApi(filterMethods.watch()),
          ordering: orderingMethods.watch(),
          pagination: {
            limit: 100,
            offset: 0,
          },
        },
      },
    });
  };

  const searchString = filterMethods.watch('searchString');

  useEffect(() => {
    doQuery();
  }, [searchString]);

  return (
    <div className={styles.filesOverviewTab}>
      <h5 className={styles.title}>Files Overview</h5>
      <div className={styles.settingsRow}>
        <Text
          size={15}
          label="Search"
          placeholder="Search string or regex"
          {...filterMethods.register('searchString')}
        />
        <Button
          variant="secondary"
          icon={<FilterIcon />}
          onClick={() => setIsFiltersModalShown(true)}
        >
          Filters
        </Button>
        <Button
          variant="secondary"
          icon={<OrderingIcon />}
          onClick={() => setIsOrderingModalShown(true)}
        >
          Ordering
        </Button>
      </div>
      <ul className={styles.itemsList}>
        {data?.datasets?.map((item) => (
          <DatasetItem data={item} key={item.fileID} />
        ))}
      </ul>
      <FormProvider {...filterMethods}>
        {isFiltersModalShown && (
          <FiltersModal
            onClose={() => setIsFiltersModalShown(false)}
            onApply={doQuery}
          />
        )}
      </FormProvider>
      <FormProvider {...orderingMethods}>
        {isOrderingModalShown && (
          <OrderingModal
            onClose={() => setIsOrderingModalShown(false)}
            onApply={doQuery}
          />
        )}
      </FormProvider>
    </div>
  );
};

export default FilesOverview;
