import classNames from 'classnames';
import Background from '@assets/backgrounds/reports.svg?component';
import { TabConfig } from 'src/routes/AdminPanel/tabs';
import { FCWithChildren } from 'types/react';
import styles from './TabsLayout.module.scss';

interface Props {
  pageClass?: string;
  containerClass?: string;
  tabs: TabConfig[];
  selectedTab: string;
  onTabSelect: (pathname: string) => void;
}

const TabsLayout: FCWithChildren<Props> = ({
  pageClass,
  containerClass,
  tabs,
  selectedTab,
  onTabSelect,
  children,
}) => {
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
          {tabs.map(({ icon, label, pathname }) => (
            <li
              key={pathname}
              className={classNames(selectedTab === pathname && styles.active)}
              onClick={() => onTabSelect(pathname)}
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

export default TabsLayout;
