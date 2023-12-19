import { Checkbox } from '@components/Inputs';

import { ControlledSelect } from '@components/Inputs/Select';
import ListPropertiesModal from '@components/ListPropertiesModal';
import React, { FC, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { AFDSortRowsBy, OrderBy } from 'types/globalTypes';
import { FiltersFields } from './Filters';

type VisibilityProps = {
  setIsVisibilityShown: (arg: boolean) => void;
};

export const VisibilityWindow: FC<VisibilityProps> = ({
  setIsVisibilityShown,
}) => {
  const baseForm = useFormContext();

  const { control, watch, reset } = useForm<Partial<FiltersFields>>({
    defaultValues: {
      rowsOrdering: baseForm.watch('rowsOrdering'),
      direction: baseForm.watch('direction'),
      showOnlyLRHS: baseForm.watch('showOnlyLRHS'),
    },
  });
  const initialShowOnlyLRHS = watch('showOnlyLRHS') as boolean;
  const [isShowOnlyLRHS, setShowOnlyLRHS] = useState(initialShowOnlyLRHS);
  const { rowsOrdering, direction } = watch();
  console.log(rowsOrdering);

  const orderingOptions = [
    { value: AFDSortRowsBy.RHS_VALUES, label: 'RHS values' },
    { value: AFDSortRowsBy.ROW_INDEX, label: 'Row index' },
  ];

  const directionOptions = [
    { value: OrderBy.ASC, label: 'Ascending' },
    { value: OrderBy.DESC, label: 'Descending' },
  ];

  return (
    <ListPropertiesModal
      name="Visibility"
      onClose={() => {
        reset();
        setIsVisibilityShown(false);
      }}
      onApply={() => {
        baseForm.setValue('rowsOrdering', rowsOrdering);
        baseForm.setValue('direction', direction);
        baseForm.setValue('showOnlyLRHS', isShowOnlyLRHS);
        setIsVisibilityShown(false);
      }}
    >
      <Checkbox
        label="Show only LHS and RHS columns"
        checked={isShowOnlyLRHS}
        onChange={() => setShowOnlyLRHS((prev) => !prev)}
      />
      <ControlledSelect
        control={control}
        controlName="rowsOrdering"
        label={'Order rows by'}
        options={orderingOptions}
      />
      <ControlledSelect
        control={control}
        controlName="direction"
        label="Direction"
        options={directionOptions}
      />
    </ListPropertiesModal>
  );
};
export default VisibilityWindow;
