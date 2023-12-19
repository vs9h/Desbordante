import { ControlledSelect } from '@components/Inputs/Select';
import ListPropertiesModal from '@components/ListPropertiesModal';
import { OrderingTitles } from '@constants/titles';
import _ from 'lodash';
import React, { FC } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { OrderBy, PrimitiveType } from 'types/globalTypes';
import { FiltersFields } from './Filters';

type OrderingProps = {
  labelOrderBy?: string;
  setIsOrderingShown: (arg: boolean) => void;
  primitive: PrimitiveType;
};

export const OrderingWindow: FC<OrderingProps> = ({
  labelOrderBy = 'Order by',
  setIsOrderingShown,
  primitive,
}) => {
  const baseForm = useFormContext();

  const { control, watch, reset } = useForm<Partial<FiltersFields>>({
    defaultValues: {
      ordering: baseForm.watch('ordering'),
      direction: baseForm.watch('direction'),
    },
  });

  const { ordering, direction } = watch();

  const orderingOptions = _.mapValues(
    OrderingTitles[primitive],
    (k: string, v: string) => ({
      label: k,
      value: v,
    }),
  );

  const directionOptions = {
    [OrderBy.ASC]: { value: OrderBy.ASC, label: 'Ascending' },
    [OrderBy.DESC]: { value: OrderBy.DESC, label: 'Descending' },
  };

  return (
    <ListPropertiesModal
      name="Ordering"
      onClose={() => {
        reset();
        setIsOrderingShown(false);
      }}
      onApply={() => {
        baseForm.setValue('ordering', ordering);
        baseForm.setValue('direction', direction);
        setIsOrderingShown(false);
      }}
    >
      <ControlledSelect
        control={control}
        controlName="ordering"
        label={labelOrderBy}
        options={_.values(orderingOptions)}
      />
      <ControlledSelect
        control={control}
        controlName="direction"
        label="Direction"
        options={_.values(directionOptions)}
      />
    </ListPropertiesModal>
  );
};
export default OrderingWindow;
