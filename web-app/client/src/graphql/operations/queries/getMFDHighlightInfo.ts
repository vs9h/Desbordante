import { gql } from '@apollo/client';

export const GET_MFD_HIGHLIGHT_INFO = gql`
  query GetMFDHighlightInfo(
    $taskID: ID!
    $clusterIndex: Int!
    $rowFilter: String!
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
                  MFDSortBy: MAXIMUM_DISTANCE
                  orderDirection: ASC
                  filterString: $rowFilter
                  pagination: { offset: 0, limit: 10 }
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
