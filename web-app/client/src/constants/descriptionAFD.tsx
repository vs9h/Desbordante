import { FC } from 'react';

const DescriptionAFD: FC = () => {
  return (
    <>
      This task checks whether a single FD holds over a provided table. In case
      if exact FD does not hold, then:
      <ol>
        <li>
          the approximate FD is checked and the error threshold is returned,
        </li>
        <li>
          the data that violates the FD is shown in the form of clusters — all
          different RHS values for a fixed LHS one.
        </li>
      </ol>
      For the notion of the approximate FD and the error threshold, check{' '}
      <a href="https://www.vldb.org/pvldb/vol11/p759-kruse.pdf">
        “Efficient discovery of approximate dependencies”
      </a>{' '}
      by S. Kruse and F. Naumann.
    </>
  );
};

export default DescriptionAFD;
