import Check from '@assets/icons/check.svg?component';
import Cross from '@assets/icons/cross.svg?component';

import Table, {
  Row,
  ScrollDirection,
  TableProps,
} from '@components/ScrollableNodeTable';
import { FC, useMemo } from 'react';

import styles from './AFDTable.module.scss';

type AFDTableProps = {
  header: string[];
  clusterNumber: number;
  totalCount: number;
  highlights: AFDTableRow[];
  onScroll: (direction: ScrollDirection) => void;
  className?: string;
};

type AFDTableRow = {
  isFrequent: boolean;
  index: number;
  snippetRow: string[];
};

const getRowColor: (index: number, isMostFrequent: boolean) => string = (
  index,
  isMostFrequent,
) => {
  if (isMostFrequent) {
    return index % 2 === 0 ? styles.greenEven : styles.greenOdd;
  }
  return index % 2 === 0 ? styles.redEven : styles.redOdd;
};

const getAFDRow: (row: AFDTableRow, position: number) => Row = (
  row,
  position,
) => {
  return {
    items: [
      row.isFrequent ? ( // icon
        <Check className={styles.checkmark} height={20} width={20} />
      ) : (
        <Cross height={20} width={20} />
      ),
      ...row.snippetRow,
    ],
    style: getRowColor(position, row.isFrequent),
    globalIndex: position,
  };
};

export const AFDTable: FC<AFDTableProps> = ({
  clusterNumber,
  highlights,
  header,
  onScroll,
  className,
}) => {
  const data: Row[] = useMemo(() => {
    const highlightData = highlights.map((row) => getAFDRow(row, row.index));

    return highlightData;
  }, [highlights]);

  const props: TableProps = {
    containerKey: clusterNumber,
    data,
    header,
    onScroll,
  };
  return <Table className={className} {...props} />;
};
