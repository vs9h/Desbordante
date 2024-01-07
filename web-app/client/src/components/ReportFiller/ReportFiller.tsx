import { FC, ReactNode } from 'react';
import styles from './ReportFiller.module.scss';

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

export default ReportFiller;
