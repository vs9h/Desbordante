import { MFDHighlight } from '@atoms/MFDTaskAtom';

import { Icon } from '@components/IconComponent';
import Table, {
  Row,
  ScrollDirection,
  TableProps,
} from '@components/ScrollableNodeTable';
import colors from '@constants/colors';
import { FC, useMemo } from 'react';
import styles from './MFDTable.module.scss';

type MFDTableProps = {
  clusterNumber: number;
  totalCount: number;
  highlights: MFDHighlight[];
  onScroll: (direction: ScrollDirection) => void;
  isFullValueShown: boolean;
  insertedRow?: {
    position: number;
    data: MFDHighlight;
  };
  insertRow: (furthestIndex: number, rowIndex: number) => void;
  closeInsertedRow: () => void;
  className?: string;
};

const getRowColor: (
  withinLimit: boolean,
  index: number,
  isHighlighted: boolean,
) => string = (withinLimit, index, isHighlighted) => {
  if (withinLimit) {
    if (isHighlighted) {
      return styles.greenHighlighted;
    } else {
      return index % 2 === 0 ? styles.greenEven : styles.greenOdd;
    }
  } else {
    if (isHighlighted) {
      return styles.redHighlighted;
    } else {
      return index % 2 === 0 ? styles.redEven : styles.redOdd;
    }
  }
};

const getMFDRow: (
  highlight: MFDHighlight,
  position: number,
  isHighlighted: boolean,
  isFullValueShown: boolean,
  callbackFunction: () => void,
) => Row = (
  highlight,
  position,
  isHighlighted,
  isFullValueShown,
  callbackFunction,
) => {
  return {
    items: [
      highlight.withinLimit ? (
        <Icon name="check" size={20} color={colors.success[100]} />
      ) : (
        <Icon name="cross" size={20} color={colors.error[100]} />
      ),
      highlight.maximumDistance,
      highlight.index,
      <div // furthest point index or close icon
        key={`furthestIndex-${highlight.rowIndex}`}
        onClick={callbackFunction}
        className={styles.clickableIndex}
      >
        {isHighlighted ? (
          <Icon name="angleArrow" className={styles.angleArrow} />
        ) : (
          highlight.furthestPointIndex
        )}
      </div>,
      <div // value
        key={`value-${highlight.value}`}
        className={!isFullValueShown ? styles.valueText : undefined}
        title={highlight.value}
      >
        {highlight.value}
      </div>,
    ],
    style: getRowColor(highlight.withinLimit, position, isHighlighted),
    globalIndex: isHighlighted ? `Highlight-${position}` : position,
  };
};

export const MFDTable: FC<MFDTableProps> = ({
  clusterNumber,
  totalCount,
  highlights,
  onScroll,
  isFullValueShown,
  insertedRow,
  insertRow,
  closeInsertedRow,
  className,
}) => {
  const data: Row[] = useMemo(() => {
    const insertRowData: Row | undefined = insertedRow
      ? getMFDRow(insertedRow.data, totalCount, true, isFullValueShown, () =>
          closeInsertedRow(),
        )
      : undefined;

    const highlightData = highlights.map((highlight) =>
      getMFDRow(highlight, highlight.rowIndex, false, isFullValueShown, () =>
        insertRow(highlight.furthestPointIndex, highlight.index),
      ),
    );

    if (insertRowData) {
      const insertPosition = highlightData.findIndex((row) => {
        return row.items[2] === insertedRow?.position;
      });

      if (insertPosition !== -1)
        highlightData.splice(insertPosition + 1, 0, insertRowData);
    }

    return highlightData;
  }, [
    closeInsertedRow,
    highlights,
    insertRow,
    insertedRow,
    isFullValueShown,
    totalCount,
  ]);

  const header = [
    'Within Limit',
    'Maximum Distance',
    'Point Index',
    'Furthest Point Index',
    'Value',
  ];

  const props: TableProps = {
    containerKey: clusterNumber,
    data,
    header,
    onScroll,
  };

  return <Table className={className} {...props} />;
};
