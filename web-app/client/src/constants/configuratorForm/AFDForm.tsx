import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import badgeStyles from '@components/Inputs/MultiSelect/OptionBadge/OptionBadge.module.scss';
import {
  MFDAlgoOptions,
  MFDColumnType,
  MFDColumnTypeOptions,
  MFDDistancesOptions,
  MFDMetricOption,
  MFDMetricOptions,
  optionsByMetrics,
} from '@constants/options';
import {
  getCountOfColumns,
  getCountOfColumns_datasetInfo_statsInfo_stats,
  getCountOfColumnsVariables,
} from '@graphql/operations/queries/__generated__/getCountOfColumns';
import { GET_COUNT_OF_COLUMNS } from '@graphql/operations/queries/getDatasetColumnCount';
import { showError } from '@utils/toasts';
import {
  Defaults,
  FormFieldsProps,
  CreateFormProcessor,
  CreateForm,
  FormSelectOptions,
  FormHook,
  Presets,
} from 'types/form';
import { OptionWithBadges } from 'types/multiSelect';

const TypesCategories: Record<string, string> = {
  Int: 'Numeric',
  Double: 'Numeric',
  BigInt: 'Numeric',
  String: 'String',
};

const AFDDefaults = {
  algorithmName: 'ApproximateVerification',
  lhsIndices: [] as number[],
  rhsIndices: [] as number[],
} satisfies Defaults;

const AFDPresets: Presets<typeof AFDDefaults> = [
  {
    filenames: 'EveryFile',
    presetName: 'Some preset',
    preset: {
      lhsIndices: [1] as number[],
      rhsIndices: [2] as number[],
    },
  },
];

// For future developers: methods.setError DOES NOT PREVENT FORM SUBMIT
const AFDFields = {
  algorithmName: {
    order: 0,
    type: 'hidden_value',
    label: '',
    isDisplayable: false,
  },
  lhsIndices: {
    order: 1,
    type: 'multi_select',
    label: 'LHS Columns',
    options: [] as FormSelectOptions,
    isLoading: true as boolean,
    rules: {
      validate: (value) => {
        if (Array.isArray(value))
          return value.length > 0 ? undefined : 'Cannot be empty';
        return undefined;
      },
    },
  },
  rhsIndices: {
    order: 2,
    type: 'multi_select',
    label: 'RHS Columns',
    options: [] as FormSelectOptions,
    isLoading: true as boolean,
    rules: {
      validate: (value) => {
        if (Array.isArray(value) && value.length === 0)
          return 'Cannot be empty';
      },
    },
  },
} satisfies FormFieldsProps<typeof AFDDefaults>;

const useAFDFormHook: FormHook<typeof AFDDefaults, typeof AFDFields> = (
  fileID,
  form,
  setForm,
) => {
  const { loading, data } = useQuery<
    getCountOfColumns,
    getCountOfColumnsVariables
  >(GET_COUNT_OF_COLUMNS, {
    variables: { fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch columns information. Please try later.",
      );
    },
  });

  const columnData = useMemo(() => {
    if (data) {
      const countOfColumns: number = data?.datasetInfo?.countOfColumns || 0;
      const statistics: getCountOfColumns_datasetInfo_statsInfo_stats[] =
        data?.datasetInfo?.statsInfo.stats || [];
      const hasHeader: boolean = data?.datasetInfo?.hasHeader || false;
      const headers: string[] = data?.datasetInfo?.header || [];

      return [...Array(countOfColumns)].map((_, i) => ({
        label: hasHeader ? `${i + 1}: ${headers[i]}` : `Column ${i + 1}`,
        value: i,
        badges: statistics
          .filter((elem) => elem.column.index == i)
          .map((elem) => ({ label: elem.type, style: badgeStyles.primary })),
      })) as OptionWithBadges[];
    }
    return [] as OptionWithBadges[];
  }, [data]);

  useEffect(() => {
    if (columnData) {
      setForm((formSnapshot) => {
        formSnapshot.lhsIndices.isLoading = loading;
        formSnapshot.rhsIndices.isLoading = loading;
        formSnapshot.lhsIndices.options = columnData;
        formSnapshot.rhsIndices.options = columnData;
        return { ...formSnapshot };
      });
    }
  }, [columnData, loading, setForm]);
};
  

export const AFDForm = CreateForm({
  formDefaults: AFDDefaults,
  formFields: AFDFields,
  useFormHook: useAFDFormHook,
  formPresets: AFDPresets,
});
