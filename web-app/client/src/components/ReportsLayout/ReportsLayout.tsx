import { Icon } from '@components/IconComponent';
import useTaskState from '@hooks/useTaskState';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { FC, PropsWithChildren } from 'react';
import { PrimitiveType } from 'types/globalTypes';
import styles from './ReportsLayout.module.scss';

interface Props extends PropsWithChildren {
  pageClass?: string;
  containerClass?: string;
}

const menuStatistics = {
  label: 'Statistics',
  pathname: '/reports/charts',
  icon: <Icon name="chart" />,
};
const menuClusters = {
  label: 'Clusters',
  pathname: '/reports/clusters',
  icon: <Icon name="cluster" />,
};
const menuPrimitiveList = {
  label: 'Primitive list',
  pathname: '/reports/dependencies',
  icon: <Icon name="listDropDown" />,
};
const menuDatasetSnippet = {
  label: 'Dataset snippet',
  pathname: '/reports/snippet',
  icon: <Icon name="datatable" />,
};
const menuMFDClusters = {
  label: 'Clusters',
  pathname: '/reports/metric-dependencies',
  icon: <Icon name="cluster" />,
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
  [PrimitiveType.Stats]: [],
};

export const ReportsLayout: FC<Props> = ({
  pageClass,
  containerClass,
  children,
}) => {
  const router = useRouter();
  const { data } = useTaskState();
  const type = data.type as PrimitiveType;

  return (
    <div className={classNames(styles.page, pageClass)}>
      <Icon name="backgroundCreateTask" className={styles.background} />
      <div className={styles.menu}>
        <ul>
          {type &&
            // primitive
            reportsTabs[type].map(({ icon, label, pathname }) => (
              <li
                key={pathname}
                className={classNames(
                  router.pathname === pathname && styles.active,
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
