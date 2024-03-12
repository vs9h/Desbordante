import {
  getTasksInfo_tasksInfo,
  getTasksInfo_tasksInfo_state,
} from '@graphql/operations/queries/__generated__/getTasksInfo';
import { FC, ReactNode, SVGProps } from 'react';
import checkFill from '@assets/icons/check-fill.svg?component';
import resourcesLimit from '@assets/icons/resources-limit.svg?component';
import serverError from '@assets/icons/server-error.svg?component';
import QueueIcon from '@assets/icons/users-queue.svg?component';
import logo from '@assets/icons/desbordante.svg?component';
import styles from './TaskItem.module.scss';
import {
  MainPrimitiveType,
  PrimitiveType,
  TaskProcessStatusType,
} from 'types/globalTypes';
import Button from '@components/Button';
import { showError, showSuccess } from '@utils/toasts';
import primitiveInfo from '@constants/primitiveInfoType';
import moment from 'moment';

const getIcon = (
  state: getTasksInfo_tasksInfo_state,
): FC<SVGProps<SVGElement>> => {
  if (state.__typename === 'InternalServerTaskError') {
    return serverError;
  }

  if (state.__typename === 'ResourceLimitTaskError') {
    return resourcesLimit;
  }

  if (state.__typename !== 'TaskState') {
    throw new Error('Wrong typename');
  }

  switch (state.processStatus) {
    case TaskProcessStatusType.ADDED_TO_THE_TASK_QUEUE:
    case TaskProcessStatusType.ADDING_TO_DB:
      return QueueIcon;
    case TaskProcessStatusType.IN_PROCESS:
      return logo;
    case TaskProcessStatusType.COMPLETED:
      return checkFill;
  }
};

const getStatus = (state: getTasksInfo_tasksInfo_state): ReactNode => {
  if (state.__typename === 'InternalServerTaskError') {
    return <span className={styles.error}>Internal server error</span>;
  }

  if (state.__typename === 'ResourceLimitTaskError') {
    return <span className={styles.error}>Resource limit reached</span>;
  }

  if (state.__typename !== 'TaskState') {
    throw new Error('Wrong typename');
  }

  switch (state.processStatus) {
    case TaskProcessStatusType.ADDED_TO_THE_TASK_QUEUE:
    case TaskProcessStatusType.ADDING_TO_DB:
      return <span className={styles.info}>Queued</span>;
    case TaskProcessStatusType.IN_PROCESS:
      return (
        <>
          <span className={styles.primary}>
            Phase {state.currentPhase}/{state.maxPhase}:
          </span>{' '}
          {state.phaseName}
        </>
      );
    case TaskProcessStatusType.COMPLETED:
      return (
        <>
          <span className={styles.success}>Completed</span> in{' '}
          {moment.duration(state.elapsedTime).humanize()}
        </>
      );
  }
};

const getPrimitiveTypeLabel = (primitive: PrimitiveType) =>
  primitiveInfo[primitive as unknown as MainPrimitiveType]?.label;

interface Props {
  data: getTasksInfo_tasksInfo;
}

const TaskItem: FC<Props> = ({ data: { state, data, taskID, dataset } }) => {
  const Icon = getIcon(state);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${location.origin}/reports?taskID=${taskID}`)
      .then(() => {
        showSuccess('Task URL was copied to your clipboard');
      })
      .catch(() => {
        showError('Could not copy cite to clipboard');
      });
  };

  return (
    <li className={styles.taskItem}>
      <Icon className={styles.statusIcon} />
      <div className={styles.middle}>
        <div className={styles.top}>
          <div className={styles.fileName}>{dataset?.originalFileName}</div>
          <div className={styles.primitiveType}>
            {getPrimitiveTypeLabel(data.baseConfig.type)}
          </div>
          <div className={styles.algorithmName}>
            {data.baseConfig.algorithmName}
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.status}>{getStatus(state)}</div>
          <div className={styles.createdAt}>
            {state.__typename === 'TaskState' &&
              moment(+state.createdAt).format('[Created] L LT')}
          </div>
          <div className={styles.user}>
            {state.__typename === 'TaskState' &&
              (state.user?.fullName ?? 'Anonymous')}
          </div>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={handleCopy}>
        Copy URL
      </Button>
    </li>
  );
};

export default TaskItem;
