import { useEffect, useRef } from 'react';
import { FieldValues, UseFormReset, UseFormSetValue, UseFormWatch } from 'react-hook-form';

const useFormPersist = <TFields extends FieldValues>(
  name: string,
  params: {
    watch: UseFormWatch<TFields>;
    setValue: UseFormSetValue<TFields>;
    reset: UseFormReset<TFields>;
    transformValues?: Partial<{
      [field in keyof TFields]: (value: any) => TFields[field];
    }>;
  },
) => {
  const initialRender = useRef(true);
  const values = params.watch();

  useEffect(() => {
    if (!initialRender.current) {
      return;
    }

    const entry = localStorage.getItem(name);
    if (!entry) {
      return;
    }

    const values = JSON.parse(entry);

    for (const key in params.transformValues) {
      if (key in values) {
        values[key] = params.transformValues?.[key]?.(values[key]);
      }
    }

    params.reset(values);
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      return;
    }

    const json = JSON.stringify(values);

    localStorage.setItem(name, json);
  }, [values]);

  useEffect(() => {
    initialRender.current = false;
  }, [])
};

export default useFormPersist;
