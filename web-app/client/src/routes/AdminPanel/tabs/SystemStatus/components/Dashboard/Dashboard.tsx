import moment from 'moment';
import { FC, useState } from 'react';
import { DateTime } from '@components/Inputs';
import styles from './Dashboard.module.scss';

const Dashboard: FC = () => {
  const [period, setPeriod] = useState<[string, string]>([
    moment().toISOString(),
    moment().toISOString(),
  ]);

  return (
    <section className={styles.dashboard}>
      <h5 className={styles.title}>Dashboard</h5>
      <DateTime label="Period" value={period} onChange={setPeriod} />
    </section>
  );
};

export default Dashboard;
