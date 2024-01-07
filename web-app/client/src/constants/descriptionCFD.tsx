import { FC } from 'react';

const DescriptionCFD: FC = () => {
  return (
    <>
      Conditional functional dependencies are relaxed form of functional
      dependencies and are mainly used for data cleaning and error detection
      problems. A single CFD is represented by two entities:
      <ol>
        <li>a binary relationship between disjoint sets of attributes and </li>
        <li>
          conditions (also known as pattern tableau) which specify the subset of
          tuples on which a relationship holds.
        </li>
      </ol>
      CFDs mining process is parameterized by confidence and support levels,
      which makes CFD in terms of resources consumption more complex concept
      than FD.
    </>
  );
};

export default DescriptionCFD;
