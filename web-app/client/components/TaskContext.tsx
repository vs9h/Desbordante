import { useQuery } from '@apollo/client';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { useRouter } from 'next/router';
import { createContext, PropsWithChildren, useContext } from 'react';

export type TaskContentType = {
  taskInfo?: getTaskInfo;
  taskID: string;
};

export const TaskContext = createContext<TaskContentType | null>(null);

export const TaskContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const taskID = router.query.taskID as string;

  const { data: taskInfo } = useQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO,
    {
      variables: { taskID },
    }
  );

  return (
    <TaskContext.Provider value={{ taskInfo, taskID }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('Cannot use task context');
  }
  return ctx;
};