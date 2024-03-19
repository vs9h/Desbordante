import { Icon } from '@components/IconComponent';
import { InputPropsBase } from '@components/Inputs';
import cn from 'classnames';
import { ComponentType } from 'react';
import {
  components,
  ControlProps,
  IndicatorsContainerProps,
  InputProps,
  OptionProps,
  PlaceholderProps,
  SingleValueProps,
  ValueContainerProps,
  NoticeProps,
} from 'react-select';
import styles from './Select.module.scss';

const Control: ComponentType<ControlProps & InputPropsBase> = ({
  children,
  error,
  innerRef,
  innerProps,
  isFocused,
}) => (
  <div
    {...innerProps}
    ref={innerRef}
    className={cn(
      styles.control,
      error && styles.error,
      isFocused && styles.focused,
    )}
  >
    {children}
  </div>
);

const ValueContainer: ComponentType<ValueContainerProps & InputPropsBase> = ({
  children,
  innerProps,
}) => (
  <div {...innerProps} className={styles.valueContainer}>
    {children}
  </div>
);

const SingleValue: ComponentType<SingleValueProps & InputPropsBase> = ({
  children,
  innerProps,
}) => (
  <div {...innerProps} className={styles.singleValue}>
    {children}
  </div>
);

const Placeholder: ComponentType<PlaceholderProps & InputPropsBase> = ({
  children,
  innerProps,
}) => (
  <div className={styles.placeholder} {...innerProps}>
    {children}
  </div>
);

const Input: ComponentType<InputProps & InputPropsBase> = (inputProps) => (
  <div className={cn(styles.input, inputProps.value && styles.hasValue)}>
    <components.Input {...inputProps} />
  </div>
);

const IndicatorsContainer: ComponentType<
  IndicatorsContainerProps & InputPropsBase
> = ({ innerProps }) => (
  <div className={styles.indicatorsContainer} {...innerProps}>
    <Icon name="angle" />
  </div>
);

export const Option: ComponentType<OptionProps & InputPropsBase> = ({
  innerProps,
  innerRef,
  children,
  isFocused,
  isSelected,
}) => (
  <div
    className={cn(
      styles.option,
      isFocused && styles.focused,
      isSelected && styles.selected,
    )}
    {...innerProps}
    ref={innerRef}
  >
    {children}
  </div>
);

const NoOptionsMessage: ComponentType<NoticeProps & InputPropsBase> = ({
  innerProps,
  children,
}) => (
  <div className={cn(styles.option, styles.noOptionsMessage)} {...innerProps}>
    {children}
  </div>
);

const customComponents = {
  Control,
  ValueContainer,
  SingleValue,
  Placeholder,
  Input,
  IndicatorsContainer,
  Option,
  NoOptionsMessage,
};

export default customComponents;
