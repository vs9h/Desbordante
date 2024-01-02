import { FC } from 'react';
import colors from '@constants/colors';
import UsageChart from '../UsageChart';
import styles from './Statistics.module.scss';

const Statistics: FC = () => {
  return (
    <section className={styles.statistics}>
      <h5 className={styles.title}>Statistics</h5>
      <div className={styles.charts}>
        <UsageChart
          title="Disk usage"
          defaultSelectedKey="used"
          items={[
            {
              key: 'used',
              label: 'Used',
              value: 87.9,
              color: colors.primary[100],
            },
          ]}
          capacity={100}
        />
        <UsageChart
          title="Files"
          defaultSelectedKey="uploaded"
          items={[
            {
              key: 'uploaded',
              label: 'Uploaded',
              value: 40,
              color: colors.primary[100],
            },
          ]}
          capacity={50}
        />
        <UsageChart
          title="Tasks"
          defaultSelectedKey="completed"
          items={[
            {
              key: 'completed',
              label: 'Completed',
              value: 60,
              color: colors.success[100],
            },
            {
              key: 'failed',
              label: 'Failed',
              value: 10,
              color: colors.error[100],
            },
            {
              key: 'queued',
              label: 'Queued',
              value: 5,
              color: colors.info[100],
            },
            {
              key: 'in-progress',
              label: 'In progress',
              value: 12,
              color: colors.primary[100],
            },
          ]}
        />
        <UsageChart
          title="Users"
          defaultSelectedKey="active"
          items={[
            {
              key: 'active',
              label: 'Active',
              value: 23,
              color: colors.primary[100],
            },
          ]}
          capacity={50}
        />
      </div>
    </section>
  );
};

export default Statistics;
