import cn from 'classnames';
import _ from 'lodash';
import { FC, useState } from 'react';
import colors from '@constants/colors';
import styles from './UsageChart.module.scss';

type UsageChartItem = {
  key: string;
  label: string;
  color: string;
  value: number;
};

interface Props {
  title: string;
  items: UsageChartItem[];
  capacity?: number;
  defaultSelectedKey?: string;
  className?: string;
}

const REMAINING_KEY = 'remaining';

const UsageChart: FC<Props> = ({
  title,
  defaultSelectedKey,
  items,
  capacity,
  className,
}) => {
  const [selectedItemKey, setSelectedItemKey] = useState(defaultSelectedKey);
  const totalOccupied = _.sumBy(items, 'value');
  let total = totalOccupied;

  if (capacity !== undefined && totalOccupied > capacity) {
    throw new Error(
      `Total occupied of items (${totalOccupied}) is greater than maximum capacity (${capacity})`,
    );
  }

  const itemsToRender = _.sortBy(items, 'value')
    .reverse()
    .filter((item) => item.value > 0);

  if (capacity !== undefined) {
    itemsToRender.push({
      key: REMAINING_KEY,
      label: 'Remaining',
      color: colors.black[10],
      value: capacity - totalOccupied,
    });

    total = capacity;
  }

  const selectedItem = itemsToRender.find(
    (item) => item.key === selectedItemKey,
  );

  return (
    <div className={cn(className, styles.usageChart)}>
      <p className={styles.title}>{title}</p>
      <div
        className={styles.chartContainer}
        onPointerLeave={() => setSelectedItemKey(defaultSelectedKey)}
      >
        {itemsToRender.map((item) => (
          <div
            key={item.key}
            style={{
              width: `${(item.value / total) * 100}%`,
              background: item.color,
              opacity:
                selectedItemKey === item.key ||
                selectedItemKey === defaultSelectedKey
                  ? '100%'
                  : '50%',
            }}
            className={styles.chartItem}
            onPointerEnter={() => setSelectedItemKey(item.key)}
          ></div>
        ))}
      </div>
      {selectedItem && (
        <small className={styles.subtitle}>
          {selectedItem.label}: {selectedItem.value} of {total}
        </small>
      )}
    </div>
  );
};

export default UsageChart;
