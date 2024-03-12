import { gql } from '@apollo/client';

export const GET_TASKS_INFO = gql`
    query getTasksInfo($props: TasksQueryProps!) {
        tasksInfo(props: $props) {
            taskID
            state {
                ... on TaskState {
                    user {
                        fullName
                    }
                    processStatus
                    phaseName
                    currentPhase
                    progress
                    maxPhase
                    isExecuted
                    elapsedTime
                    createdAt
                }
            }

            data {
                baseConfig {
                    algorithmName
                    type
                }
            }

            dataset {
                originalFileName
            }
        }
    }
`;
