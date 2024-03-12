import { FC, useEffect, useState } from 'react';
import { Text } from '@components/Inputs';
import styles from './TasksOverview.module.scss';
import Button from '@components/Button';
import FilterIcon from '@assets/icons/filter.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import FiltersModal from './components/FiltersModal';
import { Moment } from 'moment';
import { FormProvider, useForm } from 'react-hook-form';
import {
  OrderDirection,
  Pagination as PagionationType,
  TasksQueryFilters,
  TasksQueryOrderingParameter,
} from 'types/globalTypes';
import OrderingModal from './components/OrderingModal';
import { useLazyQuery } from '@apollo/client';
import {
  getTasksInfo,
  getTasksInfoVariables,
} from '@graphql/operations/queries/__generated__/getTasksInfo';
import { GET_TASKS_INFO } from '@graphql/operations/queries/getTasksInfo';
import TaskItem from './components/TaskItem';
import useFormPersist from '@hooks/useFormPersist';
import moment from 'moment';
import _ from 'lodash';
import { useRouter } from 'next/router';

export type Filters = {
  searchString?: string;
  elapsedTime: [number | undefined, number | undefined];
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
};

const defaultFilters: Filters = {
  searchString: undefined,
  elapsedTime: [undefined, undefined],
  period: [undefined, undefined],
  includeDeleted: false,
};

export type Ordering = {
  parameter: TasksQueryOrderingParameter;
  direction: OrderDirection;
};

const defaultOrdering: Ordering = {
  parameter: TasksQueryOrderingParameter.CREATION_TIME,
  direction: OrderDirection.DESC,
};

const defaultPagination: PagionationType = {
  limit: 10,
  offset: 0,
};

const filtersToApi = (filters: Filters): TasksQueryFilters => ({
  ...filters,
  searchString: filters.searchString || undefined,
  elapsedTime: filters.elapsedTime.some(Boolean)
    ? {
        from: filters.elapsedTime[0] ?? undefined,
        to: filters.elapsedTime[1] ?? undefined,
      }
    : undefined,
  period: filters.period.some(Boolean)
    ? {
        from: filters.period[0]?.toISOString() ?? undefined,
        to: filters.period[1]?.toISOString() ?? undefined,
      }
    : undefined,
});

const TasksOverview: FC = () => {
  const router = useRouter();
  const filterMethods = useForm({ defaultValues: defaultFilters });
  const orderingMethods = useForm({ defaultValues: defaultOrdering });

  const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);
  const [isOrderingModalShown, setIsOrderingModalShown] = useState(false);

  useFormPersist(`${router.asPath}-filters`, {
    ...filterMethods,
    transformValues: {
      period: (value) => value.map((v: any) => (v ? moment(v) : undefined)),
      elapsedTime: (value) => value.map((v: any) => v ?? undefined),
    },
  });

  useFormPersist(`${router.asPath}-ordering`, {
    ...orderingMethods,
  });

  const [query, { data }] = useLazyQuery<getTasksInfo, getTasksInfoVariables>(
    GET_TASKS_INFO,
  );

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
    <div className={styles.tasksOverviewTab}>
      <h5 className={styles.title}>Tasks Overview</h5>
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
        {data?.tasksInfo?.map((item) => (
          <TaskItem data={item} key={item.taskID} />
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

export default TasksOverview;
