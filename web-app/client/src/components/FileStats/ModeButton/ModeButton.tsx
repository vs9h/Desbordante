import classNames from 'classnames';
import { ButtonHTMLAttributes, FC } from 'react';
import GridIcon from '@assets/icons/grid.svg?component';
import ListIcon from '@assets/icons/list.svg?component';
import Button from '@components/Button';
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
    icon={!tableMode ? <GridIcon className={styles.grid} /> : <ListIcon />}
    className={classNames(className, styles.wrapper, styles.modeButton)}
    aria-label="Change mode"
    {...props}
  />
);
