import cn from 'classnames';
import {
  ChangeEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import ReactDateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { InputPropsBase } from '@components/Inputs';
import OutsideClickObserver from '@components/OutsideClickObserver';
import Tooltip from '@components/Tooltip';
import styles from './DateTime.module.scss';
// eslint-disable-next-line import/order
import moment, { Moment } from 'moment';
import CalendarIcon from '@assets/icons/calendar.svg?component';

type Value = [Moment | undefined, Moment | undefined];

const formatValue = (value: Value) => {
  return value.map((v) => v ? moment(v).format('L LT') : 'undefined').join(' ~ ')
};

type Props = InputPropsBase &
  Omit<HTMLProps<HTMLInputElement>, 'value' | 'onChange' | 'size'> & {
    value: Value;
    onChange: (newValue: Value) => void;
    tooltip?: ReactNode;
  };

const DateTime: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  { id, label, error, className, tooltip, value, onChange, ...props },
  ref,
) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'start' | 'end'>('start');
  const [isFocused, setIsFocused] = useState(false);
  const selectorRef = useRef<ReactDateTime>(null);
  const uniqueId = useId();

  // useEffect(() => {
  //   selectorRef.current.navi;
  // }, [selectedMode]);

  const inputId = id || uniqueId;

  const currentSeenValue = value[selectedMode === 'start' ? 0 : 1];

  const handleDropdownChange = (newValue: string | Moment) => {
    const newExternalValue = value.slice() as Value;
    const parsedValue = moment(newValue);

    newExternalValue[selectedMode === 'start' ? 0 : 1] = parsedValue;

    onChange(newExternalValue);
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const {value} = event.target;

    setInputText(value);
    
    const newValue = value.split(' ~ ').map((timestamp) => timestamp === 'undefined' ? undefined : moment(timestamp));
    const isValid = newValue.every((v) => v === undefined || v.isValid());

    if (newValue.length === 2 && isValid) {
      onChange(newValue as Value);
    }
  };

  useEffect(() => {
    setInputText(formatValue(value));
  }, [value])

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
      <div className={cn(styles.inputContainer, isFocused && styles.focused)}>
        <input
          ref={ref}
          id={inputId}
          className={cn(error && styles.error)}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          value={inputText}
          size={34}
          {...props}
        />
        <CalendarIcon />
      </div>

      {isFocused && (
        <div className={styles.dropdownContainer}>
          <OutsideClickObserver
            className={styles.dropdown}
            onClickOutside={() => setIsFocused(false)}
          >
            <div className={styles.modes}>
              <button
                className={cn(
                  styles.modeButton,
                  selectedMode === 'start' && styles.selected,
                )}
                onClick={() => setSelectedMode('start')}
              >
                Start
              </button>
              <span>~</span>
              <button
                className={cn(
                  styles.modeButton,
                  selectedMode === 'end' && styles.selected,
                )}
                onClick={() => setSelectedMode('end')}
              >
                End
              </button>
            </div>
            <ReactDateTime
              key={selectedMode}
              value={currentSeenValue}
              onChange={handleDropdownChange}
              input={false}
              ref={selectorRef}
              className={styles.rdtContainer}
            />
          </OutsideClickObserver>
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default forwardRef(DateTime);
