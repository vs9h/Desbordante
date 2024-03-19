import { Icon } from '@components/IconComponent';
import { useTaskContext } from '@components/TaskContext';
import { GeneralColumn } from '@utils/convertDependencies';
import classNames from 'classnames';
import _ from 'lodash';
import { FC, ReactElement } from 'react';
import styles from './DependencyList.module.scss';

type Props = {
  deps: {
    confidence?: number;
    rhs: GeneralColumn[];
    lhs: GeneralColumn[];
  }[];
  infoVisible: boolean;
};

const makeSide: (
  data: GeneralColumn | GeneralColumn[],
  infoVisible: boolean,
) => ReactElement = (data, infoVisible) => {
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((e) => (
          <span className={styles.attr} key={e.column.index}>
            {e.column.name}
            {infoVisible && e.pattern ? ' | ' + e.pattern : ''}
          </span>
        ))}
      </>
    );
  } else {
    return makeSide([data], infoVisible);
  }
};

const DependencyList: FC<Props> = ({ deps, infoVisible }) => {
  const { selectedDependency, selectDependency, errorDependency } =
    useTaskContext();

  return (
    <div className={styles.dependencyListContainer}>
      {_.map(deps, (row, i) => {
        const fullDependency = row.lhs.concat(row.rhs);
        const isError =
          JSON.stringify(errorDependency) === JSON.stringify(fullDependency);
        const isSelected =
          JSON.stringify(selectedDependency) === JSON.stringify(fullDependency);

        return (
          <div
            key={i}
            className={classNames(
              styles.row,
              isSelected && styles.selectedRow,
              isError && styles.errorRow,
            )}
            onClick={() => selectDependency(isSelected ? [] : fullDependency)}
          >
            {makeSide(row.lhs, infoVisible)}
            <div className={styles.arrowContainer}>
              <Icon name="longArrow" />
              {row.confidence !== undefined && (
                <small>{row.confidence * 100}%</small>
              )}
            </div>
            {makeSide(row.rhs, infoVisible)}
          </div>
        );
      })}
    </div>
  );
};

export default DependencyList;
