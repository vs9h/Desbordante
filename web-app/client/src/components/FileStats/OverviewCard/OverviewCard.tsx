import { FC } from 'react';
import { useToggle } from '@components/FileStats/hooks';
import { ModeButton } from '@components/FileStats/ModeButton';
import { Paper } from '@components/FileStats/Paper';
import { StatsBlock } from '@components/FileStats/StatsBlock';
import { StatType } from 'types/fileStats';
import styles from './OverviewCard.module.scss';

type OverflowCardProps = {
  stats: StatType[];
};

export const OverviewCard: FC<OverflowCardProps> = ({
  stats,
}: OverflowCardProps) => {
  const [tableMode, toggleMode] = useToggle(false);

  return (
    <Paper className={styles.wrapper}>
      <StatsBlock stats={stats} tableMode={tableMode} size="xl" />
      <ModeButton tableMode={tableMode} onClick={toggleMode} />
    </Paper>
  );
};
