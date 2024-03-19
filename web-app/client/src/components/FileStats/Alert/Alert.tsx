import { Icon } from '@components/IconComponent';
import colors from '@constants/colors';
import classNames from 'classnames';
import { FC, HTMLProps, ReactNode } from 'react';
import styles from './Alert.module.scss';

type AlertVariant = 'info' | 'error' | 'success' | 'warning';

type AlertProps = {
  variant?: AlertVariant;
  header?: ReactNode;
} & HTMLProps<HTMLDivElement>;

const alertIcons: Record<AlertVariant, ReactNode> = {
  info: <Icon name="info" size={48} color={colors.info[100]} />,
  error: <Icon name="error" size={48} color={colors.error[100]} />,
  success: <Icon name="checkFill" size={48} color={colors.success[100]} />,
  warning: <Icon name="error" size={48} color={colors.error[100]} />,
};

export const Alert: FC<AlertProps> = ({
  className,
  children,
  variant = 'info',
  header,
  ...props
}: AlertProps) => (
  <article
    role="alert"
    className={classNames(className, styles.wrapper, styles[variant])}
    {...props}
  >
    {alertIcons[variant]}
    <div>
      {header && <p className={styles.header}>{header}</p>}
      <p>{children}</p>
    </div>
  </article>
);
