import EyeIcon from '@assets/icons/eye.svg?component';
import ArrowCrossed from '@assets/icons/line-arrow-right-crossed.svg?component';
import Arrow from '@assets/icons/line-arrow-right.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import Button from '@components/Button';

import { OrderingWindow, useFilters } from '@components/Filters';
import VisibilityWindow from '@components/Filters/AFDVisibilityWindow';
import Pagination from '@components/Pagination/Pagination';
import ReportFiller from '@components/ReportFiller/ReportFiller';
import ReportsLayout from '@components/ReportsLayout';

import { AFDTable } from '@components/ScrollableNodeTable/implementations/AFD/AFDTable';
import styles from '@styles/ApproximateDependencies.module.scss';

import React, { ReactElement, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { PrimitiveType } from 'types/globalTypes';
import { NextPageWithLayout } from 'types/pageWithLayout';
import { data } from './AFDFakeData';
import { Scrolling } from './onScroll';

const ReportsAFD: NextPageWithLayout = () => {
  const [clusterIndex, setClusterIndex] = useState(0);

  const [isOrderingShown, setIsOrderingShown] = useState(false);
  const [isVisibilityShown, setIsVisibilityShown] = useState(false);

  const { threshold, violatingRows, clustersTotalCount } = data.result;
  const { frequentness, mostFrequentValue, size, distinctRHSValues } =
    data.clusterInfo;

  const methods = useFilters(PrimitiveType.AFD);

  const onScroll = Scrolling();

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
          <VisibilityWindow onCloseWindow={() => setIsVisibilityShown(false)} />
        )}
      </FormProvider>

      {data.result === undefined && <ReportFiller title={'Loading'} />}
      {data.result !== undefined && (
        <>
          {!clustersTotalCount && data.result && (
            <ReportFiller
              title="No clusters have been discovered (functional dependency holds)"
              description="Try restarting the task with different parameters"
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

ReportsAFD.getLayout = function getLayout(page: ReactElement) {
  return <ReportsLayout>{page}</ReportsLayout>;
};

export default ReportsAFD;
