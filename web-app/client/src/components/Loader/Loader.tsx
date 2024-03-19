import { Icon, IconName } from '@components/IconComponent';
import { primitivePathnames } from '@constants/primitiveReportPathnames';
import useTaskState from '@hooks/useTaskState';
import getTaskStatusData from '@utils/getTaskStatusData';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { PrimitiveType } from 'types/globalTypes';
import styles from './Loader.module.scss';

const Loader: FC = () => {
  const router = useRouter();
  const { data, error } = useTaskState();
  const status = getTaskStatusData(error, data.state);

  useEffect(() => {
    const { state, type } = data;

    if (
      state &&
      'processStatus' in state &&
      state.processStatus === 'COMPLETED' &&
      type !== ''
    ) {
      setTimeout(() => {
        void router.push({
          pathname: primitivePathnames[type as PrimitiveType],
          query: {
            taskID: data.taskID,
          },
        });
      }, 500);
    }
  }, [data, router]);

  const icon = status.isAnimated ? (
    <video
      autoPlay
      muted
      loop
      width={70}
      height={76}
      data-testid="animated-icon"
    >
      <source src={status.icon} type="video/webm" />
    </video>
  ) : (
    <Icon name={status.icon as IconName} size={76} {...status.iconProps} />
  );
  return (
    <div className={styles.container}>
      {icon}
      <div className={styles.text}>
        <h6>
          Task status:
          <span className={cn(styles[status.className], styles.status)}>
            {' '}
            {status.label}
          </span>
        </h6>
        <p className={styles.description}>{status.description}</p>
      </div>
    </div>
  );
};
export default Loader;
