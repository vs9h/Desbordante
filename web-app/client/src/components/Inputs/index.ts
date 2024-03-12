import Checkbox from './Checkbox';
import DateTime from './DateTime';
import MultiSelect from './MultiSelect';
import NumberInput from './NumberInput';
import NumberRange from './NumberRange';
import NumberSlider from './NumberSlider';
import Radio from './Radio';
import Select from './Select';
import Text from './Text';
import TextArea from './TextArea';

export interface InputPropsBase {
  error?: string;
  label?: string;
}

export {
  Text,
  TextArea,
  Checkbox,
  Select,
  Radio,
  NumberSlider,
  NumberInput,
  NumberRange,
  MultiSelect,
  DateTime,
};
