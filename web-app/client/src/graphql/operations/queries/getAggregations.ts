import { gql } from '@apollo/client';

export const GET_AGGREGATIONS = gql`
  query getAggregations($config: AggregationConfig!) {
    aggregations {
      users(config: $config) {
        from
        to
        totalUsers
        newUsers
        activeUsers
        logIns
      }
      tasks(config: $config) {
        from
        to
        totalTasks
        successfullyExecutedNewTasks
        failedNewTasks
      }
      files(config: $config) {
        from
        to
        totalSpaceOccupied
        totalFiles
        newFiles
      }
    }
  }
`;
