import { MFDHighlight } from '@atoms/MFDTaskAtom';
import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import { ControlledSelect } from '@components/Inputs/Select';

import ListPropertiesModal from '@components/ListPropertiesModal';
import Pagination from '@components/Pagination/Pagination';
import ReportsLayout from '@components/ReportsLayout';

import { ScrollDirection } from '@components/ScrollableNodeTable';
import { MFDTable } from '@components/ScrollableNodeTable/implementations/MFDTable';
import useMFDHighlight from '@hooks/useMFDHighlight';
import useMFDTask from '@hooks/useMFDTask';
import styles from '@styles/MetricDependencies.module.scss';
import _ from 'lodash';
import { useRouter } from 'next/router';
import React, {
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';

import { MFDSortBy, OrderBy } from 'types/globalTypes';

import { NextPageWithLayout } from 'types/pageWithLayout';

type InsertedRow =
  | {
      position: number;
      data: MFDHighlight;
    }
  | undefined;

const ReportsMFD: NextPageWithLayout = () => {
  const defaultLimit = 150;
  const defaultOffsetDifference = 50;

  const router = useRouter();
  const taskID = router.query.taskID as string;

  const shouldIgnoreScrollEvent = useRef(false);

  // TODO: move parameters in one object
  const [clusterIndex, setClusterIndex] = useState(0);
  const [limit, setLimit] = useState(defaultLimit);
  const [sortBy, setSortBy] = useState(MFDSortBy.MAXIMUM_DISTANCE);
  const [orderBy, setOrderBy] = useState(OrderBy.ASC);

  const { data, loading, error } = useMFDTask(
    taskID,
    clusterIndex,
    limit,
    sortBy,
    orderBy,
  );

  useEffect(() => {
    if (!loading && !error && data) {
      shouldIgnoreScrollEvent.current = false;
    }
  }, [data, error, loading, limit]);

  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [showFullValue, setShowFullValue] = useState(false);

  const [isInserted, setIsInserted] = useState(false);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [RowIndex, setRowIndex] = useState(0);
  const [furthestData, setFurthestData] = useState(undefined as InsertedRow);

  const [loadMFDHighlight, { data: highlightData }] = useMFDHighlight();

  useEffect(() => {
    if (isInserted) {
      if (
        highlightData &&
        highlightData.taskInfo &&
        highlightData.taskInfo.data.__typename === 'TaskWithDepsData' &&
        highlightData.taskInfo.data.result &&
        highlightData.taskInfo.data.result.__typename === 'MFDTaskResult'
      ) {
        const highlight =
          highlightData.taskInfo.data.result.filteredDeps.deps[0];

        setFurthestData({
          position: RowIndex,
          data: {
            index: highlight.index,
            rowIndex: highlightData.taskInfo.data.result.depsAmount + 1,
            withinLimit: highlight.withinLimit,
            maximumDistance: highlight.maximumDistance,
            furthestPointIndex: highlight.furthestPointIndex,
            value: highlight.value,
            clusterValue: highlight.clusterValue,
          },
        });
      } else {
        setFurthestData(undefined);
      }
    } else {
      setFurthestData(undefined);
    }
  }, [
    isInserted,
    highlightData,
    RowIndex,
    furthestIndex,
    data.cluster.highlightsTotalCount,
  ]);

  const insertRow = useCallback(
    (furthestIndex: number, rowIndex: number) => {
      setFurthestIndex(furthestIndex);
      setRowIndex(rowIndex);
      setIsInserted(true);
      void loadMFDHighlight({
        variables: {
          taskID,
          clusterIndex,
          rowFilter: `index=${furthestIndex}`,
        },
      });
    },
    [loadMFDHighlight, taskID, clusterIndex],
  );

  const closeInsertedRow = useCallback(() => {
    setIsInserted(false);
  }, []);

  // TODO: move logic to the table component and make API for that
  const onScroll = useCallback(
    (direction: ScrollDirection) => {
      if (!shouldIgnoreScrollEvent.current && direction === 'down') {
        shouldIgnoreScrollEvent.current = true;
        if (limit < data.cluster.highlightsTotalCount) {
          setLimit((limit) => limit + defaultOffsetDifference);
        } else {
          shouldIgnoreScrollEvent.current = false;
        }
      }
    },
    [data.cluster.highlightsTotalCount, limit],
  );

  return (
    <>
      {isOrderingShown && (
        <OrderingWindow
          setIsOrderingShown={setIsOrderingShown}
          setSortBy={setSortBy}
          setOrderBy={setOrderBy}
        />
      )}
      {data.result === undefined && <ReportFiller title={'Loading'} />}
      {data.result !== undefined && (
        <>
          {!data.clustersTotalCount && data.result && (
            <ReportFiller
              title={
                'No clusters have been discovered (metric dependency holds)'
              }
              description={'Try restarting the task with different parameters'}
              icon={<Icon name="lineArrowRight" />}
            />
          )}
          {!data.clustersTotalCount && !data.result && (
            <ReportFiller
              title={
                'No clusters have been discovered (metric dependency may not hold)'
              }
              description={'Try restarting the task with different parameters'}
              icon={<Icon name="lineArrowRightCrossed" />}
            />
          )}
          {data.clustersTotalCount !== 0 && !data.result && (
            <div className={styles.clustersContainer}>
              <h5>Clusters</h5>

              <div className={styles.filters}>
                <div className={styles.buttons}>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<Icon name="ordering" />}
                    onClick={() => setIsOrderingShown(true)}
                  >
                    Ordering
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<Icon name="eye" />}
                    onClick={() => setShowFullValue((e) => !e)}
                  >
                    {showFullValue ? 'Hide' : 'Show'} full value
                  </Button>
                </div>
              </div>

              <h6>Cluster value: {data.cluster.value || 'loading'}</h6>

              <MFDTable
                clusterNumber={clusterIndex}
                totalCount={data.clustersTotalCount}
                highlights={data.cluster.highlights}
                onScroll={onScroll}
                isFullValueShown={showFullValue}
                insertedRow={furthestData}
                insertRow={insertRow}
                closeInsertedRow={closeInsertedRow}
                className={styles.table}
              />

              {data.clustersTotalCount && (
                <Pagination
                  count={data.clustersTotalCount}
                  current={clusterIndex + 1}
                  onChange={(page) => {
                    setClusterIndex(page - 1);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

ReportsMFD.getLayout = function getLayout(page: ReactElement) {
  return <ReportsLayout>{page}</ReportsLayout>;
};

type ReportFillerProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

const ReportFiller: FC<ReportFillerProps> = ({ title, description, icon }) => {
  return (
    <div className={styles.container}>
      <div className={styles.filler}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div className={styles.text}>
          <h6>{title}</h6>
          {description && <p>{description}</p>}
        </div>
      </div>
    </div>
  );
};

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  setSortBy: (arg: MFDSortBy) => void;
  setOrderBy: (arg: OrderBy) => void;
};

type SortingProps = {
  sorting: MFDSortBy;
  ordering: OrderBy;
};

const OrderingWindow: FC<OrderingProps> = ({
  setIsOrderingShown,
  setSortBy,
  setOrderBy,
}) => {
  const sortingOptions = [
    { value: MFDSortBy.POINT_INDEX, label: 'Point index' },
    { value: MFDSortBy.FURTHEST_POINT_INDEX, label: 'Furthest point index' },
    { value: MFDSortBy.MAXIMUM_DISTANCE, label: 'Maximum distance' },
  ];

  const orderingOptions = {
    [OrderBy.ASC]: { value: OrderBy.ASC, label: 'Ascending' },
    [OrderBy.DESC]: { value: OrderBy.DESC, label: 'Descending' },
  };

  const { control, watch, reset } = useForm<SortingProps>({
    defaultValues: {
      sorting: MFDSortBy.MAXIMUM_DISTANCE,
      ordering: OrderBy.ASC,
    },
  });

  const { sorting, ordering } = watch();

  // TODO: Fix "value.match..." error when changing form parameter (this error is present on deployed version, btw)
  return (
    <ListPropertiesModal
      name="Ordering"
      onClose={() => {
        reset();
        setIsOrderingShown(false);
      }}
      onApply={() => {
        setSortBy(sorting);
        setOrderBy(ordering);
        setIsOrderingShown(false);
      }}
    >
      <ControlledSelect
        control={control}
        controlName="sorting"
        label="Sort by"
        options={_.values(sortingOptions)}
      />
      <ControlledSelect
        control={control}
        controlName="ordering"
        label="Direction"
        options={_.values(orderingOptions)}
      />
    </ListPropertiesModal>
  );
};

export default ReportsMFD;
