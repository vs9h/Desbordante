import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import cn from 'classnames';
import styles from './Chart.module.scss';
import moment from 'moment';
import { Formatter } from 'recharts/types/component/DefaultTooltipContent';

type TickFormatter = (value: string) => string;
type TooltipFormatter = Formatter<string, string>;

const xAxisTickFotmatter = (value: string) => moment(Number(value)).format('L');

const tooltipLabelFormatter = (label: string) =>
  moment(Number(label)).format('L LT');

interface Props<TData> {
  data: TData[];
  keys: { key: keyof TData; label: string; color: string; yAxisId?: string }[];
  className?: string;
  YAxisFormatter?: TickFormatter;
  tooltipFormatter?: TooltipFormatter;
}

const Chart = <TData,>({
  data,
  keys,
  className,
  YAxisFormatter,
  tooltipFormatter,
}: Props<TData>) => {
  return (
    <div className={cn(className, styles.aggregationChart)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          syncId="admin-panel-dashboard-sync"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="to" tickFormatter={xAxisTickFotmatter} minTickGap={20} />
          <YAxis yAxisId="left" tickFormatter={YAxisFormatter} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            labelFormatter={tooltipLabelFormatter}
            formatter={tooltipFormatter}
          />
          <Legend />
          {keys.map(({ key, label, color, yAxisId }) => (
            <Line
              type="monotone"
              dataKey={key as string}
              stroke={color}
              strokeWidth={2}
              name={label}
              key={key as string}
              yAxisId={yAxisId ?? 'left'}
            />
          ))}
          <Brush />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
