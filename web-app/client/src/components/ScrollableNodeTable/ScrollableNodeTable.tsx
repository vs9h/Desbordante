import classNames from 'classnames';
import _ from 'lodash';
import {
  FC,
  UIEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { TableProps } from './TableTypes';
import styles from './ScrollableNodeTable.module.scss';

const mapFromArray = <T,>(array?: T[]) =>
  Object.fromEntries(array?.map((item) => [item, true]) || []);

const Table: FC<TableProps> = ({
  containerKey = null,
  data,
  header,
  highlightRowIndices,
  highlightColumnIndices,
  hiddenColumnIndices,
  onScroll,
  className,
  alternateRowColors = true,
}) => {
  const threshold = 200;

  const tableDivRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const isScrolledToTop = useRef(false);

  // move the table to the top on page load
  useEffect(() => {
    if (tableDivRef.current)
      tableDivRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });

    isScrolledToTop.current = true;
  }, []);

  const displayHeader = useMemo(
    () => header || data[0].items.map((_, index) => `Column ${index}`),
    [header, data],
  );

  const highlightedRowsMap = useMemo(
    () => mapFromArray(highlightRowIndices),
    [highlightRowIndices],
  );

  const highlightedColumnsMap = useMemo(
    () => mapFromArray(highlightColumnIndices),
    [highlightColumnIndices],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnScroll = useCallback(
    _.debounce(onScroll || (async () => undefined), 500),
    [onScroll],
  );

  const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
    if (!isScrolledToTop.current) return;

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    if (scrollTop !== positionRef.current) {
      const scrollDifference = positionRef.current - scrollTop;

      positionRef.current = scrollTop;
      if (scrollTop < threshold && scrollDifference > 0) {
        debouncedOnScroll('up');
      }

      if (
        scrollHeight - clientHeight - scrollTop < threshold &&
        scrollDifference < 0
      ) {
        debouncedOnScroll('down');
      }
    }
  };

  return (
    <div
      key={containerKey}
      className={classNames(styles.container, className)}
      onScroll={handleScroll}
      ref={tableDivRef}
    >
      <table className={styles.table}>
        <thead>
          <tr className={classNames(alternateRowColors && styles.alternate)}>
            {displayHeader.map((item, columnIndex) => (
              <td
                key={item}
                className={classNames(
                  columnIndex in highlightedColumnsMap && styles.highlighted,
                  hiddenColumnIndices &&
                    hiddenColumnIndices.includes(columnIndex) &&
                    styles.hidden,
                )}
              >
                {item}
              </td>
            ))}
          </tr>
        </thead>

        <tbody>
          {data &&
            data.map((row) => (
              <tr
                key={row.globalIndex}
                className={classNames(styles.row, row.style)}
              >
                {row.items.map((item, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={classNames(
                      (row.globalIndex in highlightedRowsMap ||
                        columnIndex in highlightedColumnsMap) &&
                        styles.highlighted,
                      hiddenColumnIndices &&
                        hiddenColumnIndices.includes(columnIndex) &&
                        styles.hidden,
                    )}
                  >
                    {item}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
