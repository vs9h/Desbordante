import { FC } from 'react';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import styles from './SystemStatus.module.scss';

const SystemStatus: FC = () => {
  return (
    <div className={styles.systemStatusTab}>
      <Dashboard />
      <Statistics />
    </div>
  );
};

export default SystemStatus;
