import { FC, useState } from 'react';
import Button from '@components/Button';
import { Alert } from '@components/FileStats/Alert';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import styles from '../StatsTab.module.scss';
import { Stage } from './Stage';

type StartStageProps = {
  onStart: (threadsCount: number) => void;
  maxThreadsCount: number;
};

export const StartStage: FC<StartStageProps> = ({
  onStart,
  maxThreadsCount,
}: StartStageProps) => {
  const [threadsCount, setThreadsCount] = useState(1);

  return (
    <Stage
      buttons={
        <Button onClick={() => onStart(threadsCount)}>Start Processing</Button>
      }
    >
      <Alert>
        Statistics have not been processed yet.
        <br />
        Would you like to start processing?
      </Alert>
      <NumberSlider
        className={styles.numberSlider}
        size={1}
        sliderProps={{ min: 1, max: maxThreadsCount, step: 1 }}
        label="Thread count"
        value={threadsCount}
        onChange={(value) => setThreadsCount(Math.round(value))}
      />
    </Stage>
  );
};
