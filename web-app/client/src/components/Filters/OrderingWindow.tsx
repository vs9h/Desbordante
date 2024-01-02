import _ from 'lodash';
import React, { FC } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { ControlledSelect } from '@components/Inputs/Select';
import ListPropertiesModal from '@components/ListPropertiesModal';
import { OrderingTitles } from '@constants/titles';
import { OrderDirection, PrimitiveType } from 'types/globalTypes';
import { FiltersFields } from './Filters';

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  primitive: PrimitiveType;
};

export const OrderingWindow: FC<OrderingProps> = ({
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
    })
  );

  const directionOptions = {
    [OrderDirection.ASC]: { value: OrderDirection.ASC, label: 'Ascending' },
    [OrderDirection.DESC]: { value: OrderDirection.DESC, label: 'Descending' },
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
        label="Order by"
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
