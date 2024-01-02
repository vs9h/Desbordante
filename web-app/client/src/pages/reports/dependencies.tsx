import { useLazyQuery } from '@apollo/client';
import type { GetServerSideProps } from 'next';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import EyeIcon from '@assets/icons/eye.svg?component';
import FilterIcon from '@assets/icons/filter.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import Button from '@components/Button';
import DependencyList from '@components/DependencyList/DependencyList';
import DownloadResult from '@components/DownloadResult';
import {
  FilteringWindow,
  getSortingParams,
  OrderingWindow,
  useFilters,
} from '@components/Filters';
import { Text } from '@components/Inputs';
import Pagination from '@components/Pagination/Pagination';
import ReportsLayout from '@components/ReportsLayout';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import client from '@graphql/client';
import {
  GetMainTaskDeps,
  GetMainTaskDepsVariables,
} from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import { getTaskInfo } from '@graphql/operations/queries/__generated__/getTaskInfo';
import { GET_MAIN_TASK_DEPS } from '@graphql/operations/queries/getDeps';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import styles from '@styles/Dependencies.module.scss';
import { convertDependencies } from '@utils/convertDependencies';
import { IntersectionFilter, OrderDirection, PrimitiveType } from 'types/globalTypes';
import { NextPageWithLayout } from 'types/pageWithLayout';

type Props = {
  defaultData?: GetMainTaskDeps;
};

const ReportsDependencies: NextPageWithLayout<Props> = ({ defaultData }) => {
  const {
    taskInfo,
    taskID,
    dependenciesFilter: {
      rhs: mustContainRhsColIndices,
      lhs: mustContainLhsColIndices,
    },
  } = useTaskContext();

  const primitive: PrimitiveType | undefined =
    taskInfo?.taskInfo.data.baseConfig.type;
  const methods = useFilters(primitive || PrimitiveType.FD);
  const { watch, register, setValue: setFilterParam } = methods;
  const { search, page, ordering, direction, showKeys } = watch();

  const [infoVisible, setInfoVisible] = useState(true);
  const [getDeps, { loading, data, previousData }] = useLazyQuery<
    GetMainTaskDeps,
    GetMainTaskDepsVariables
  >(GET_MAIN_TASK_DEPS);
  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [isFilteringShown, setIsFilteringShown] = useState(false);

  const filter = useMemo<IntersectionFilter>(() => {
    const sortingParams = {
      [(primitive === PrimitiveType.TypoFD ? PrimitiveType.FD : primitive) +
      'SortBy']: ordering,
    };

    return {
      withoutKeys: showKeys,
      filterString: search,
      pagination: { limit: 10, offset: (page - 1) * 10 },
      ...sortingParams,
      orderDirection: direction,
      mustContainRhsColIndices: mustContainRhsColIndices.length
        ? mustContainRhsColIndices
        : null,
      mustContainLhsColIndices: mustContainLhsColIndices.length
        ? mustContainLhsColIndices
        : null,
    };
  }, [
    primitive,
    search,
    page,
    ordering,
    direction,
    showKeys,
    mustContainRhsColIndices,
    mustContainLhsColIndices,
  ]);

  useEffect(() => {
    if (!primitive) return;

    getDeps({
      variables: {
        taskID,
        filter,
      },
    });
  }, [taskID, primitive, getDeps, filter]);

  // todo add loading text/animation, maybe in Pagination component too
  const shownData = (loading ? previousData : data) || defaultData;
  const recordsCount =
    shownData?.taskInfo.data.result &&
    'filteredDeps' in shownData?.taskInfo.data.result &&
    shownData?.taskInfo.data.result.filteredDeps.filteredDepsAmount;

  const deps = convertDependencies(primitive, shownData);

  return (
    <>
      <FormProvider {...methods}>
        {isOrderingShown && (
          <OrderingWindow
            {...{
              setIsOrderingShown,
              primitive: primitive || PrimitiveType.FD,
            }}
          />
        )}

        {isFilteringShown && (
          <FilteringWindow
            {...{
              setIsFilteringShown,
            }}
          />
        )}
      </FormProvider>

      <h5>Primitive List</h5>

      <div className={styles.filters}>
        <Text
          label="Search"
          placeholder="Attribute name or regex"
          className={styles.search}
          {...register('search')}
        />
        <div className={styles.buttons}>
          <Button
            variant="secondary"
            size="md"
            icon={<FilterIcon />}
            onClick={() => setIsFilteringShown(true)}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<OrderingIcon />}
            onClick={() => setIsOrderingShown(true)}
          >
            Ordering
          </Button>
          {primitive && (
            <>
              {[PrimitiveType.AR, PrimitiveType.CFD].includes(primitive) && (
                <Button
                  variant="secondary"
                  size="md"
                  icon={<EyeIcon />}
                  onClick={() => setInfoVisible((e) => !e)}
                >
                  Visibility
                </Button>
              )}
              {primitive !== PrimitiveType.TypoFD && (
                <DownloadResult filter={filter} disabled={!deps.length} />
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.rows}>
        <DependencyList {...{ deps, infoVisible }} />
      </div>

      <div className={styles.pagination}>
        <Pagination
          onChange={(n) => setFilterParam('page', n)}
          current={page}
          count={Math.ceil((recordsCount || 10) / 10)}
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.taskID) {
    const { data } = await client.query<getTaskInfo>({
      query: GET_TASK_INFO,
      variables: { taskID: context.query.taskID },
    });

    const sortingParams = getSortingParams(data.taskInfo.data.baseConfig.type);

    const { data: taskDeps } = await client.query<GetMainTaskDeps>({
      query: GET_MAIN_TASK_DEPS,
      variables: {
        taskID: context.query.taskID,
        filter: {
          withoutKeys: false,
          filterString: '',
          pagination: { limit: 10, offset: 0 },
          ...sortingParams,
          orderDirection: OrderDirection.ASC,
        },
      },
    });
    return {
      props: {
        defaultData: taskDeps,
      },
    };
  }

  return {
    props: {},
  };
};

ReportsDependencies.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsDependencies;
