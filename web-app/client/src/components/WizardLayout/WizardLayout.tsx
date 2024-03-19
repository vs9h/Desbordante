import { Icon } from '@components/IconComponent';
import cn from 'classnames';
import { FC, PropsWithChildren, ReactElement } from 'react';
import styles from './WizardLayout.module.scss';

interface Props extends PropsWithChildren {
  header: ReactElement;
  footer: ReactElement;
  className?: string;
}

const WizardLayout: FC<Props> = ({ header, footer, className, children }) => {
  return (
    <div className={styles.page}>
      <Icon name="backgroundCreateTask" className={styles.background} />
      <div className={styles.sectionText}>{header}</div>
      <div className={cn(className, styles.content)}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
};

export default WizardLayout;
