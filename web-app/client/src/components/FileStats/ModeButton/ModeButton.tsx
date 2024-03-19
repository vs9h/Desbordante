import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import classNames from 'classnames';
import { ButtonHTMLAttributes, FC } from 'react';
import styles from './ModeButton.module.scss';

type ModeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tableMode: boolean;
};

export const ModeButton: FC<ModeButtonProps> = ({
  className,
  tableMode,
  ...props
}: ModeButtonProps) => (
  <Button
    variant="secondary"
    icon={!tableMode ? <Icon name="grid" /> : <Icon name="list" />}
    className={classNames(className, styles.wrapper, styles.modeButton)}
    aria-label="Change mode"
    {...props}
  />
);
