import EyeIcon from '@assets/icons/eye.svg?component';
import ArrowCrossed from '@assets/icons/line-arrow-right-crossed.svg?component';
import Arrow from '@assets/icons/line-arrow-right.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import Button from '@components/Button';

import { OrderingWindow, useFilters } from '@components/Filters';
import VisibilityWindow from '@components/Filters/AFDVisibilityWindow';
import Pagination from '@components/Pagination/Pagination';
import ReportsLayout from '@components/ReportsLayout';

import { ScrollDirection } from '@components/ScrollableNodeTable';
import { AFDTable } from '@components/ScrollableNodeTable/implementations/AFD/AFDTable';
import styles from '@styles/ApproximateDependencies.module.scss';

import React, {
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FormProvider } from 'react-hook-form';
import { PrimitiveType } from 'types/globalTypes';
import { NextPageWithLayout } from 'types/pageWithLayout';
import { data } from './AFDFakeData';

const ReportsMFD: NextPageWithLayout = () => {
  const defaultLimit = 150;
  const shouldIgnoreScrollEvent = useRef(false);

  // TODO: move parameters in one object
  const [clusterIndex, setClusterIndex] = useState(0);
  const [limit, setLimit] = useState(defaultLimit);

  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [isVisibilityShown, setIsVisibilityShown] = useState(false);

  const { threshold, violatingRows, clustersTotalCount } = data.result;
  const { frequentness, mostFrequentValue, size, distinctRHSValues } =
    data.clusterInfo;

  const methods = useFilters(PrimitiveType.AFD);

  useEffect(() => {
    shouldIgnoreScrollEvent.current = false;
  });
  const defaultOffsetDifference = 50;

  const onScroll = useCallback(
    (direction: ScrollDirection) => {
      if (!shouldIgnoreScrollEvent.current && direction === 'down') {
        shouldIgnoreScrollEvent.current = true;
        if (limit < data.result.clustersTotalCount) {
          setLimit((limit) => limit + defaultOffsetDifference);
        } else {
          shouldIgnoreScrollEvent.current = false;
        }
      }
    },
    [limit],
  );

  return (
    <>
      <FormProvider {...methods}>
        {isOrderingShown && (
          <OrderingWindow
            {...{
              setIsOrderingShown,
              primitive: PrimitiveType.AFD,
              labelOrderBy: 'Order Clusters by',
            }}
          />
        )}

        {isVisibilityShown && (
          <VisibilityWindow setIsVisibilityShown={setIsVisibilityShown} />
        )}
      </FormProvider>

      {data.result === undefined && <ReportFiller title={'Loading'} />}
      {data.result !== undefined && (
        <>
          {!clustersTotalCount && data.result && (
            <ReportFiller
              title={
                'No clusters have been discovered (functional dependency holds)'
              }
              description={'Try restarting the task with different parameters'}
              icon={<Arrow />}
            />
          )}
          {!clustersTotalCount && !data.result && (
            <ReportFiller
              title={
                'No clusters have been discovered (functional dependency may not hold)'
              }
              description={'Try restarting the task with different parameters'}
              icon={<ArrowCrossed />}
            />
          )}
          {clustersTotalCount !== 0 && data.result && (
            <div className={styles.clustersContainer}>
              <h5>Clusters</h5>
              <div className={styles.subHeader}>
                <span>Error threshold: {threshold}.</span>
                <span>Violating rows: {violatingRows}.</span>
              </div>

              <div className={styles.filters}>
                <div className={styles.buttons}>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<OrderingIcon />}
                    onClick={() => setIsOrderingShown(true)}
                  >
                    Ordering
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<EyeIcon />}
                    onClick={() => setIsVisibilityShown(true)}
                  >
                    Visibility
                  </Button>
                </div>
              </div>

              <div className={styles.subHeader}>
                <span>Size: {size}.</span>
                <span>Distinct RHS values: {distinctRHSValues}.</span>
                <span>
                  Most frequent values:{' '}
                  {`${mostFrequentValue} (${frequentness}%).`}
                </span>
              </div>

              <AFDTable
                clusterNumber={clusterIndex}
                totalCount={data.result.clustersTotalCount}
                highlights={data.clusterInfo.rows}
                onScroll={onScroll}
                className={styles.table}
                header={data.header}
              />

              {clustersTotalCount && (
                <Pagination
                  count={clustersTotalCount}
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

export default ReportsMFD;
