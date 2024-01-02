import { FC } from 'react';
import styles from './Dashboard.module.scss';

const Dashboard: FC = () => {
  return (
    <section className={styles.dashboard}>
      <h5 className={styles.title}>Dashboard</h5>
    </section>
  );
};

export default Dashboard;
