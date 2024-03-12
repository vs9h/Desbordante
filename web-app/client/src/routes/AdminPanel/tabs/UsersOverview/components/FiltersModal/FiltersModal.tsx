import React, { FC, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox, DateTime, NumberRange } from '@components/Inputs';
import ListPropertiesModal from '@components/ListPropertiesModal';
import { Filters } from '../../UsersOverview';
import styles from './FiltersModal.module.scss';
import { ControlledSelect } from '@components/Inputs/Select';
import { countries } from 'countries-list';

const countryNames = Object.entries(countries).map(([, country]) => country);

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
    <ControlledSelect
      control={control}
      controlName="country"
      label="Country"
      placeholder="Select country"
      className={styles.countrySelector}
      options={countryNames.map(({ emoji, native, name }) => ({
        label: `${emoji} ${native}`,
        value: name,
      }))}
    />
      <Controller
        control={control}
        name="period"
        render={({ field: { value, onChange } }) => (
          <DateTime
            label="Period"
            value={value}
            onChange={onChange}
            className={styles.periodInput}
          />
        )}
      />
      <Checkbox label="Include deleted" {...register('includeDeleted')} />
    </ListPropertiesModal>
  );
};

export default FilterModal;
