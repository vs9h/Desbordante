import React, { FC, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, DateTime, NumberRange } from '@components/Inputs';
import ListPropertiesModal from '@components/ListPropertiesModal';
import { Filters } from '../../FilesOverview';
import styles from './FiltersModal.module.scss';

interface Props {
  onClose: () => void;
  onApply: () => void;
}

const FilterModal: FC<Props> = ({ onClose, onApply }) => {
  const { control, register } = useFormContext<Filters>();

  return (
    <ListPropertiesModal
      name="Filters"
      onClose={onClose}
      onApply={() => {
        onApply();
        onClose();
      }}
    >
      <Controller
        control={control}
        name="fileSize"
        render={({ field: { value, onChange } }) => (
          <NumberRange
            label="Size (megabytes)"
            size={5}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="period"
        render={({ field: { value, onChange } }) => (
          <DateTime
            label="Uploaded"
            value={value}
            onChange={onChange}
            className={styles.periodInput}
          />
        )}
      />
      <Checkbox label="Include deleted" {...register('includeDeleted')} />
      <Checkbox label="Include built-in" {...register('includeBuiltIn')} />
    </ListPropertiesModal>
  );
};

export default FilterModal;
