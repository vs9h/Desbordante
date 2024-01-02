import { useLazyQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import MFDAtom, { MFDAtomDefaultValuesWithParams } from '@atoms/MFDTaskAtom';
import {
  GetMFDTaskInfo,
  GetMFDTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/GetMFDTaskInfo';
import { GET_MFD_TASK_INFO } from '@graphql/operations/queries/getMFDTaskInfo';
import { showError } from '@utils/toasts';
import { MFDSortBy, OrderDirection } from 'types/globalTypes';

const useMFDTask = (
  taskID: string,
  clusterIndex = 0,
  limit = 150,
  sortBy = MFDSortBy.MAXIMUM_DISTANCE,
  orderDirection = OrderDirection.ASC
) => {
  const [MFDTask, setMFDTask] = useAtom(MFDAtom);
  const [loadMFDData, { loading, error, data }] = useLazyQuery<
    GetMFDTaskInfo,
    GetMFDTaskInfoVariables
  >(GET_MFD_TASK_INFO, {
    variables: {
      taskID,
      clusterIndex,
      offset: 0,
      limit,
      sortBy,
      orderDirection,
    },
    onError: (error) => {
      console.error(error);
      showError(error.message, "Can't fetch task data. Please try later.");
    },
  });

  useEffect(() => {
    if (
      MFDTask.taskID !== taskID ||
      MFDTask.clusterIndex !== clusterIndex ||
      MFDTask.pagination.limit !== limit ||
      MFDTask.sortBy !== sortBy ||
      MFDTask.result === undefined
    ) {
      void loadMFDData();
    }
  }, []);

  useEffect(() => {
    if (
      data &&
      data.taskInfo &&
      data.taskInfo.data.__typename === 'TaskWithDepsData' &&
      data.taskInfo.data.result &&
      data.taskInfo.data.result.__typename === 'MFDTaskResult'
    ) {
      const taskResult = data.taskInfo.data.result;
      const clusterValue =
        !taskResult.result && taskResult.filteredDeps.deps.length
          ? taskResult.filteredDeps.deps[0].clusterValue
          : '';

      setMFDTask({
        ...MFDAtomDefaultValuesWithParams(
          taskID,
          clusterIndex,
          limit,
          sortBy,
          orderDirection
        ),
        result: taskResult.result || false,
        clustersTotalCount: taskResult.depsAmount || 0,
        cluster: {
          value: clusterValue,
          highlightsTotalCount: taskResult.filteredDeps.filteredDepsAmount || 0,
          highlights: (taskResult.filteredDeps.deps || []).map(
            (highlight, index) => ({ ...highlight, rowIndex: index })
          ),
        },
      });
    } else {
      if (MFDTask.taskID !== taskID || MFDTask.result === undefined) {
        setMFDTask({
          ...MFDAtomDefaultValuesWithParams(
            taskID,
            clusterIndex,
            limit,
            sortBy
          ),
        });
      }
    }
  }, [loading, error, data, setMFDTask, clusterIndex, taskID, limit]);

  return {
    data:
      MFDTask.taskID === taskID
        ? MFDTask
        : MFDAtomDefaultValuesWithParams(taskID, clusterIndex, limit),
    loading: loading || MFDTask.taskID !== taskID,
    error,
  };
};

export default useMFDTask;
