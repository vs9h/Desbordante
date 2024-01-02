import Checkbox from './Checkbox';
import DateTime from './DateTime';
import MultiSelect from './MultiSelect';
import NumberInput from './NumberInput';
import NumberSlider from './NumberSlider';
import Radio from './Radio';
import Select from './Select';
import Text from './Text';

export interface InputPropsBase {
  error?: string;
  label?: string;
}

export {
  Text,
  Checkbox,
  Select,
  Radio,
  NumberSlider,
  NumberInput,
  MultiSelect,
  DateTime,
};
