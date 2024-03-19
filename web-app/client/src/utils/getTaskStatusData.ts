import { ApolloError } from '@apollo/client';
import { TaskState } from '@atoms/primaryAtoms/taskStateAtom';
import colors from '@constants/colors';

const getTaskStatusData = (
  error: ApolloError | undefined,
  state: TaskState | undefined,
) => {
  if (error) {
    return {
      icon: 'serverError',
      label: 'Internal Server Error',
      iconProps: { color: colors.error[100] },
      className: 'error',
      description: 'Something went wrong with our server',
    };
  }
  if (!state) {
    return {
      icon: 'usersQueue',
      label: 'Queued',
      iconProps: { colorCenter: colors.info[100] },
      className: 'queued',
      description: 'Task is waiting to be executed',
    };
  }
  if (state.__typename === 'TaskState') {
    if (state.processStatus === 'COMPLETED') {
      return {
        icon: 'checkFill',
        label: 'Completed',
        iconProps: { color: colors.success[100] },
        className: 'completed',
        description: 'You will see the results in a moment',
      };
    }

    if (state.processStatus === 'ADDING_TO_DB') {
      return {
        icon: '/logo-animation.webm',
        isAnimated: true,
        label: 'In Progress',
        className: 'progress',
        description: `Adding task to the database`,
      };
    }
    if (state.processStatus === 'IN_PROCESS') {
      return {
        icon: '/logo-animation.webm',
        isAnimated: true,
        label: 'In Progress',
        className: 'progress',
        description: `Step ${state.currentPhase} of ${state.maxPhase}: ${state.phaseName}`,
      };
    }
  }
  if (state.__typename === 'InternalServerTaskError') {
    return {
      icon: 'serverError',
      label: 'Internal Server Error',
      iconProps: { color: colors.error[100] },
      className: 'error',
      description: 'Something went wrong with our server',
    };
  }
  if (state.__typename === 'ResourceLimitTaskError') {
    return {
      label: 'resource Limit Reached',
      icon: 'resourcesLimit',
      iconProps: { color: colors.error[100] },
      className: 'resources-limit',
      description: 'Our server ran out of resources while executing your task',
    };
  }

  return {
    icon: '/logo-animation.webm',
    isAnimated: true,
    label: 'In Progress',
    className: 'progress',
    description: '',
  };
};

export default getTaskStatusData;
