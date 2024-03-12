import moment, { Moment } from 'moment';
import { FC, useState } from 'react';
import { DateTime, Select } from '@components/Inputs';
import styles from './Dashboard.module.scss';
import { CapitalizedOption, capitalize } from '@utils/capitalizeOptions';
import { useQuery } from '@apollo/client';
import { GET_AGGREGATIONS } from '@graphql/operations/queries/getAggregations';
import {
  getAggregations,
  getAggregationsVariables,
} from '@graphql/operations/queries/__generated__/getAggregations';
import { AggregationConfig, PeriodGranularity } from 'types/globalTypes';
import Chart from '../Chart';
import colors from '@constants/colors';
import prettyBytes from 'pretty-bytes';
import { Controller, useForm } from 'react-hook-form';
import { ControlledSelect } from '@components/Inputs/Select';

const granularityOptions = Object.keys(PeriodGranularity).map((value) => ({
  value,
  label: capitalize(value),
}));

type Filters = {
  period: [Moment | undefined, Moment | undefined];
  granularity: PeriodGranularity;
};

const defaultFilters: Filters = {
  period: [moment().startOf('day').subtract(1, 'week'), moment()],
  granularity: PeriodGranularity.DAY,
};

const filtersToApi = (filters: Filters): AggregationConfig => ({
  granularity: filters.granularity,
  from: filters.period[0]?.toISOString(),
  to: filters.period[1]?.toISOString(),
});

const Dashboard: FC = () => {
  const { watch, control } = useForm({ defaultValues: defaultFilters });

  const { data } = useQuery<getAggregations, getAggregationsVariables>(
    GET_AGGREGATIONS,
    {
      variables: {
        config: filtersToApi(watch()),
      },
    },
  );

  const aggregations = data?.aggregations;

  return (
    <section className={styles.dashboard}>
      <h5 className={styles.title}>Dashboard</h5>
      <div className={styles.optionsPanel}>
        <Controller
          control={control}
          name="period"
          render={({ field: { value, onChange } }) => (
            <DateTime
              label="Period"
              value={value}
              onChange={onChange}
              className={styles.periodInput}
            />
          )}
        />
        <ControlledSelect
          control={control}
          label='Granularity'
          controlName="granularity"
          options={granularityOptions}
          className={styles.granularitySelect}
        />
      </div>
      {aggregations && (
        <div className={styles.charts}>
          {aggregations.files && (
            <Chart
              data={aggregations.files}
              YAxisFormatter={(value) => prettyBytes(+value)}
              tooltipFormatter={(value, name, props) =>
                props.dataKey === 'totalSpaceOccupied'
                  ? prettyBytes(+value)
                  : value
              }
              keys={[
                {
                  key: 'totalSpaceOccupied',
                  label: 'Total space occupied',
                  color: colors.primary[100],
                },
                {
                  key: 'totalFiles',
                  label: 'Total files',
                  yAxisId: 'right',
                  color: colors.info[100],
                },
                {
                  key: 'newFiles',
                  label: 'New files',
                  yAxisId: 'right',
                  color: colors.info[50],
                },
              ]}
            />
          )}
          {aggregations.tasks && (
            <Chart
              data={aggregations.tasks}
              keys={[
                {
                  key: 'totalTasks',
                  label: 'Total tasks',
                  color: colors.primary[100],
                },
                {
                  key: 'successfullyExecutedNewTasks',
                  label: 'Successfully executed new tasks',
                  color: colors.success[100],
                },
                {
                  key: 'failedNewTasks',
                  label: 'Failed new tasks',
                  color: colors.error[100],
                },
              ]}
            />
          )}
          {aggregations.users && (
            <Chart
              data={aggregations.users}
              keys={[
                {
                  key: 'totalUsers',
                  label: 'Total users',
                  color: colors.primary[100],
                },
                {
                  key: 'newUsers',
                  label: 'New users',
                  color: colors.primary[50],
                },
                {
                  key: 'activeUsers',
                  label: 'Active users',
                  color: colors.success[100],
                },
                { key: 'logIns', label: 'Logins', color: colors.info[100] },
              ]}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default Dashboard;
