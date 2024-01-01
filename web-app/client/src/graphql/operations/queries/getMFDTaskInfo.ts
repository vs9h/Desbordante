import { gql } from '@apollo/client';

export const GET_MFD_TASK_INFO = gql`
  query GetMFDTaskInfo(
    $taskID: ID!
    $clusterIndex: Int!
    $offset: Int!
    $limit: Int!
    $sortBy: MFDSortBy!
    $orderDirection: OrderDirection!
  ) {
    taskInfo(taskID: $taskID) {
      __typename

      data {
        ... on TaskWithDepsData {
          result {
            ... on MFDTaskResult {
              depsAmount
              result
              filteredDeps(
                filter: {
                  MFDSortBy: $sortBy
                  orderDirection: $orderDirection
                  filterString: ""
                  pagination: { offset: $offset, limit: $limit }
                  MFDClusterIndex: $clusterIndex
                }
              ) {
                filteredDepsAmount
                ... on FilteredMFDs {
                  deps {
                    index
                    withinLimit
                    maximumDistance
                    furthestPointIndex
                    value
                    clusterValue
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
