import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { FC, PropsWithChildren } from 'react';
import Background from '@assets/backgrounds/reports.svg?component';
import ChartIcon from '@assets/icons/chart.svg?component';
import ClusterIcon from '@assets/icons/cluster.svg?component';
import DatatableIcon from '@assets/icons/datatable.svg?component';
import DropDownIcon from '@assets/icons/list-dropdown.svg?component';
import { useTaskContext } from '@components/TaskContext';
import useTaskState from '@hooks/useTaskState';
import { PrimitiveType } from 'types/globalTypes';
import styles from './ReportsLayout.module.scss';

interface Props extends PropsWithChildren {
  pageClass?: string;
  containerClass?: string;
}

const menuStatistics = {
  label: 'Statistics',
  pathname: '/reports/charts',
  icon: <ChartIcon />,
};
const menuClusters = {
  label: 'Clusters',
  pathname: '/reports/clusters',
  icon: <ClusterIcon />,
};
const menuPrimitiveList = {
  label: 'Primitive list',
  pathname: '/reports/dependencies',
  icon: <DropDownIcon />,
};
const menuDatasetSnippet = {
  label: 'Dataset snippet',
  pathname: '/reports/snippet',
  icon: <DatatableIcon />,
};
const menuMFDClusters = {
  label: 'Clusters',
  pathname: '/reports/metric-dependencies',
  icon: <ClusterIcon />,
};
const menuAFDClusters = {
  label: 'Clusters',
  pathname: '/reports/approximate-dependencies',
  icon: <ClusterIcon />,
};

export const reportsTabs: Record<
  PrimitiveType,
  { label: string; pathname: string; icon: any }[]
> = {
  [PrimitiveType.TypoCluster]: [],
  [PrimitiveType.FD]: [menuStatistics, menuPrimitiveList, menuDatasetSnippet],
  [PrimitiveType.CFD]: [menuStatistics, menuPrimitiveList, menuDatasetSnippet],
  [PrimitiveType.AR]: [menuPrimitiveList, menuDatasetSnippet],
  [PrimitiveType.TypoFD]: [menuPrimitiveList, menuClusters, menuDatasetSnippet],
  [PrimitiveType.MFD]: [menuMFDClusters],
  [PrimitiveType.AFD]: [menuAFDClusters],
  [PrimitiveType.Stats]: [],
};

export const ReportsLayout: FC<Props> = ({
  pageClass,
  containerClass,
  children,
}) => {
  const router = useRouter();
  const { data } = useTaskState();
  const type =
    data.taskID === 'b30c10d1-348a-4624-86f5-3f83f42c4319'
      ? PrimitiveType.AFD
      : (data.type as PrimitiveType);

  return (
    <div className={classNames(styles.page, pageClass)}>
      <Background
        className={styles.background}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      />
      <div className={styles.menu}>
        <ul>
          {type &&
            // primitive
            reportsTabs[type].map(({ icon, label, pathname }) => (
              <li
                key={pathname}
                className={classNames(
                  router.pathname === pathname && styles.active
                )}
                onClick={() =>
                  router.push({
                    pathname,
                    query: router.query,
                  })
                }
              >
                {icon}
                <p>{label}</p>
              </li>
            ))}
        </ul>
      </div>
      <div className={classNames(styles.content, containerClass)}>
        {children}
      </div>
    </div>
  );
};
