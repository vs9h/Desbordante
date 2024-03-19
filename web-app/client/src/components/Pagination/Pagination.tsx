import { Icon } from '@components/IconComponent';
import colors from '@constants/colors';
import * as React from 'react';
import { FC } from 'react';
import ReactPaginate from 'react-paginate';
import styles from './Pagination.module.scss';

type Props = {
  count: number;
  current: number;
  onChange: (page: number) => void;
};

const Pagination: FC<Props> = ({ current, count, onChange }) => {
  return (
    <div>
      <ReactPaginate
        breakLabel="..."
        nextLabel={
          <Icon
            name="angle"
            color={colors.black[75]}
            size={16}
            orientation="right"
          />
        }
        onPageChange={(e) => onChange(e.selected + 1)}
        pageRangeDisplayed={5}
        pageCount={count}
        previousLabel={
          <Icon
            name="angle"
            color={colors.black[75]}
            size={16}
            orientation="right"
          />
        }
        className={styles.container}
        forcePage={current - 1}
      />
    </div>
  );
};

export default Pagination;
