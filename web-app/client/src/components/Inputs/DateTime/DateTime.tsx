import cn from 'classnames';
import {
  ChangeEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import ReactDateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { InputPropsBase } from '@components/Inputs';
import Tooltip from '@components/Tooltip';
import styles from './DateTime.module.scss';
// eslint-disable-next-line import/order
import moment, { Moment } from 'moment';

type Value = [string, string];

const formatValue = (value: Value) => {
  return value.map((v) => moment(v).format('l LT')).join(' ~ ');
};

type Props = InputPropsBase &
  Omit<HTMLProps<HTMLInputElement>, 'value' | 'onChange'> & {
    value: Value;
    onChange: (newValue: Value) => void;
    tooltip?: ReactNode;
  };

const DateTime: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, tooltip, value, onChange, ...props },
  ref,
) => {
  const [selectedMode, setSelectedMode] = useState<'start' | 'end'>('start');
  const [isDropdownShow, setIsDropdownShown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();
  const inputId = id || uniqueId;

  const currentSeenValue = value[selectedMode === 'start' ? 0 : 1];

  const handleDropdownChange = (newValue: string | Moment) => {
    const newExternalValue = value.slice() as Value;
    const parsedValue = moment(newValue).toISOString();

    newExternalValue[selectedMode === 'start' ? 0 : 1] = parsedValue;

    onChange(newExternalValue);
  };

  //   const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {};

  return (
    <div
      className={cn(
        styles.inputDateTime,
        props.disabled && styles.disabled,
        className,
      )}
    >
      <div className={styles.top}>
        {label && <label htmlFor={inputId}>{label}</label>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <input
        ref={ref}
        id={inputId}
        className={cn(error && styles.error)}
        // onChange={handleInputChange}
        onFocus={() => setIsDropdownShown(true)}
        onBlur={() => setIsDropdownShown(false)}
        value={formatValue(value)}
        {...props}
      />

      {isDropdownShow && (
        <div className={styles.dropdown} ref={dropdownRef}>
          <ReactDateTime
            value={currentSeenValue}
            onChange={handleDropdownChange}
            input={false}
          />
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default forwardRef(DateTime);
