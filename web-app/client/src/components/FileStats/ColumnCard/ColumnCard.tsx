import Button from '@components/Button';
import { Badge } from '@components/FileStats/Badge';
import { useToggle } from '@components/FileStats/hooks';
import { ModeButton } from '@components/FileStats/ModeButton';
import { Paper } from '@components/FileStats/Paper';
import { StatsBlock } from '@components/FileStats/StatsBlock';
import { Icon } from '@components/IconComponent';
import { getFileStats_datasetInfo_statsInfo_stats as ColumnStats } from '@graphql/operations/queries/__generated__/getFileStats';
import classNames from 'classnames';
import { FC, HTMLProps } from 'react';
import { Collapse } from 'react-collapse';
import styles from './ColumnCard.module.scss';

type ColumnCardProps = {
  columnStats: ColumnStats;
  compact?: boolean;
} & HTMLProps<HTMLDivElement>;

export const ColumnCard: FC<ColumnCardProps> = ({
  className,
  columnStats,
  compact,
  ...props
}: ColumnCardProps) => {
  const [showDetails, toggleDetails] = useToggle(false);

  const [tableMode, toggleMode] = useToggle(false);

  const header = (
    <div className={styles.header}>
      <div className={styles.nameWithBadges}>
        <div className={styles.name}>
          <span>#{columnStats.column.index + 1}</span>
          <h6>{columnStats.column.name}</h6>
        </div>
        <div className={styles.badges}>
          <Badge mode="secondary">{columnStats.type}</Badge>
          {columnStats.isCategorical && <Badge>Categorical</Badge>}
        </div>
      </div>
      <ModeButton tableMode={tableMode} onClick={toggleMode} />
    </div>
  );

  const content = (
    <div className={classNames(styles.content, tableMode && styles.tableMode)}>
      <div className={styles.basicStats}>
        <StatsBlock
          tableMode={tableMode}
          stats={[
            { name: 'Distinct', value: columnStats.distinct },
            { name: 'Count', value: columnStats.count },
          ]}
          size="lg"
        />
        <StatsBlock
          tableMode={tableMode}
          stats={[
            { name: 'Avg', value: columnStats.avg },
            { name: 'Std', value: columnStats.STD },
          ]}
          size="lg"
        />
      </div>
      <Collapse isOpened={showDetails || !!compact}>
        <div className={styles.moreStats}>
          <StatsBlock
            tableMode={tableMode}
            stats={[
              { name: 'Min', value: columnStats.min },
              { name: 'Max', value: columnStats.max },
              { name: 'Quantile 25', value: columnStats.quantile25 },
              { name: 'Quantile 50', value: columnStats.quantile50 },
              { name: 'Quantile 75', value: columnStats.quantile75 },
            ]}
            header="Quantile stats"
          />
          <StatsBlock
            tableMode={tableMode}
            stats={[
              { name: 'Skewness', value: columnStats.skewness },
              { name: 'Kurtosis', value: columnStats.kurtosis },
              { name: 'Sum', value: columnStats.sum },
            ]}
            header="Descriptive stats"
          />
        </div>
      </Collapse>
    </div>
  );

  return (
    <Paper
      className={classNames(
        className,
        styles.wrapper,
        compact && styles.compact,
      )}
      {...props}
    >
      {header}

      {content}

      {!compact && (
        <Button
          variant="secondary"
          icon={<Icon name="angle" orientation={showDetails ? 'up' : 'down'} />}
          className={styles.detailsButton}
          onClick={toggleDetails}
          aria-label={!showDetails ? 'Show details' : 'Hide details'}
        >
          {!showDetails ? 'Show details' : 'Hide details'}
        </Button>
      )}
    </Paper>
  );
};
