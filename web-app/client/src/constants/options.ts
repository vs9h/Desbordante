import { upperCase, UpperCaseOption } from '@utils/uppercaseOptions';
import { MainPrimitiveType } from 'types/globalTypes';

function toScreamingSnakeOption<T extends string>(
  value: T
): UpperCaseOption<T> {
  return {
    value: upperCase(value.replaceAll(' ', '_') as T),
    label: value,
  };
}

const FDAlgorithms = [
  'Pyro',
  'TaneX',
  'FastFDs',
  'HyFD',
  'FD mine',
  'DFD',
  'Dep Miner',
  'FDep',
  'FUN',
] as const;

type FDAlgorithm = (typeof FDAlgorithms)[number];
type CFDAlgorithm = 'CTane';
type ARAlgorithm = 'Apriori';
type AFDAlgorithm = 'Naive AFD Verifier';

// const MFDAlgorithms = ['BRUTE', 'APPROX', 'CALIPERS'] as const;
const MFDAlgorithms = ['Brute', 'Approx', 'Calipers'] as const;

export type MFDAlgorithm = (typeof MFDAlgorithms)[number];

export type Algorithms =
  | FDAlgorithm
  | CFDAlgorithm
  | ARAlgorithm
  | MFDAlgorithm
  | AFDAlgorithm;

type AlgoProps = 'arity' | 'threshold' | 'threads';

const toAlgoOption = (algo: Algorithms) => ({
  value: algo,
  label: algo,
});

export type AlgoOption = ReturnType<typeof toAlgoOption>;
export const FDoptions: AlgoOption[] = FDAlgorithms.map(toAlgoOption);
export const TypoOptions = FDoptions;
export const CFDoptions: AlgoOption[] = [toAlgoOption('CTane')];
export const ARoptions: AlgoOption[] = [toAlgoOption('Apriori')];
export const ApproxOptions: AlgoOption[] = [toAlgoOption('Pyro')];
export const AFDOptions: AlgoOption[] = [toAlgoOption('Naive AFD Verifier')];

const toScreamingSnakeAlgoOption = (algo: Algorithms): AlgoOption => {
  return {
    value: upperCase(algo.replaceAll(' ', '_')) as Algorithms,
    label: algo,
  };
};

export const MFDAlgoOptions: AlgoOption[] = MFDAlgorithms.map(
  toScreamingSnakeAlgoOption
);

export const optionsByPrimitive: Record<MainPrimitiveType, AlgoOption[]> = {
  [MainPrimitiveType.FD]: FDoptions,
  [MainPrimitiveType.AR]: ARoptions,
  [MainPrimitiveType.CFD]: CFDoptions,
  [MainPrimitiveType.TypoFD]: TypoOptions,
  [MainPrimitiveType.MFD]: MFDAlgoOptions,
  [MainPrimitiveType.Stats]: [], // Pechenux to reviewers: temporary solution
};

export const optionsByAlgorithms: Record<Algorithms, AlgoProps[]> = {
  Pyro: ['threshold', 'arity', 'threads'],
  TaneX: ['threshold', 'arity'],
  FastFDs: ['threads'],
  HyFD: ['threads'],
  'FD mine': [],
  DFD: ['threads'],
  'Dep Miner': [],
  FDep: [],
  FUN: [],
  CTane: [],
  Apriori: [],
  Brute: [], // Metric Algorithms
  Approx: [], // Metric Algorithms
  Calipers: [], // Metric Algorithms
};

// ------------------------ METRIC FUNCTIONAL DEPENDENCIES ONLY PARAMETERS ---------------------------

// Metrics Options

const MFDMetrics = ['Euclidean', 'Cosine', 'Levenshtein'] as const;

export type MFDMetric = (typeof MFDMetrics)[number];

export type MFDMetricOption = UpperCaseOption<MFDMetric>;

export const MFDMetricOptions: MFDMetricOption[] = MFDMetrics.map(
  toScreamingSnakeOption
);

export const metricOptionsByPrimitive: Record<
  MainPrimitiveType,
  MFDMetricOption[]
> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MFD]: MFDMetricOptions,
  [MainPrimitiveType.Stats]: [], // Pechenux to reviewers: temporary solution
};

export const optionsByMetrics: Record<MFDMetric, string[]> = {
  Euclidean: [],
  Cosine: ['qgram'],
  Levenshtein: [],
};

export type MFDColumnType = 'Numeric' | 'String';

export type MFDColumnTypeOption = {
  label: string;
  value: MFDColumnType;
};

export const MFDColumnTypeOptions: MFDColumnTypeOption[] = [
  { label: 'Numeric', value: 'Numeric' },
  { label: 'String', value: 'String' },
];

export const metricColumnTypeOptionsByPrimitive: Record<
  MainPrimitiveType,
  MFDColumnTypeOption[]
> = {
  [MainPrimitiveType.FD]: [],
  [MainPrimitiveType.AR]: [],
  [MainPrimitiveType.CFD]: [],
  [MainPrimitiveType.TypoFD]: [],
  [MainPrimitiveType.MFD]: MFDColumnTypeOptions,
  [MainPrimitiveType.Stats]: [], // Pechenux to reviewers: temporary solution
};

export const optionsByColumnTypes: Record<MFDColumnType, string[]> = {
  Numeric: [],
  String: [],
};

export type MFDDistanceToNull = 'Infinity' | 'Zero';

export type MFDDistancesOption = {
  label: MFDDistanceToNull;
  value: boolean;
};

export const MFDDistancesOptions: MFDDistancesOption[] = [
  { label: 'Infinity', value: true },
  { label: 'Zero', value: false },
];
