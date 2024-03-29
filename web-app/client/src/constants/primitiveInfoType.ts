import { MainPrimitiveType } from 'types/globalTypes';

export type PrimitiveInfoType = {
  label: string;
  description: string;
  link: string;
};

const primitiveInfo: Record<MainPrimitiveType, PrimitiveInfoType> = {
  [MainPrimitiveType.FD]: {
    label: 'Functional Dependencies',
    description:
      'Functional dependencies are crucial metadata for performing schema normalization, data cleaning and various data profiling tasks. A single FD represents a relationship between two disjoint sets of attributes, which states that the values from one set uniquely determine the values of another. Such hidden patterns provide a great start to get to know your data.',
    link: 'https://mstrutov.github.io/Desbordante/guides/fd-mining.html',
  },
  [MainPrimitiveType.CFD]: {
    label: 'Conditional Functional Dependencies',
    description:
      'Conditional functional dependencies are relaxed form of functional dependencies and are mainly used for data cleaning and error detection problems. A single CFD is represented by two entities: (1) a binary relationship between disjoint sets of attributes and (2) conditions (also known as pattern tableau) which specify the subset of tuples on which a relationship holds. CFDs mining process is parameterized by confidence and support levels, which makes CFD in terms of resources consumption more complex concept than FD.',
    link: 'https://mstrutov.github.io/Desbordante/guides/cfd-mining.html',
  },
  [MainPrimitiveType.AR]: {
    label: 'Association Rules',
    description:
      'Association rule is one of the most prominent concept of a frequent pattern mining. To mine association rules a dataset have to be presented in a transactional layout -- each record of such dataset is a unique transaction which contains items that were obtained during the transaction. At first, an AR mining algorithm defines frequently met items in a dataset, i.e. itemsets, and then constructs relationships between them according to specified confidence and support levels. Constructed relationships are binary and a single AR {X} => {Y} represents a fact that if itemset X was met in a transaction, then itemset Y can be met as well.',
    link: 'https://mstrutov.github.io/Desbordante/guides/ar-mining.html',
  },
  [MainPrimitiveType.TypoFD]: {
    label: 'Error Detection Pipeline',
    description:
      'Error detection pipeline is a built-in functionality for detecting typos and mispells which can prevent some functional dependency from holding on a dataset. In the first step, pipeline initiates process for approximate functional dependencies mining. Next, the user selects an approximate functional dependency that "almost" holds and inspect the differences in the right-hand side of a dependency among the cluster\'s tuples. Finally, the user chooses which values should be fixed and makes the corresponding changes.',
    link: 'https://mstrutov.github.io/Desbordante/guides/error-detection-pipeline.html',
  },
} as const;

export default primitiveInfo;
