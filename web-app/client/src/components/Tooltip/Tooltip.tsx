import { Icon } from '@components/IconComponent';
import colors from '@constants/colors';
import cn from 'classnames';
import { useState } from 'react';
import { FCWithChildren } from 'types/react';

import styles from './Tooltip.module.scss';

interface Props {
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const Tooltip: FCWithChildren<Props> = ({
  className,
  position = 'top',
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn(styles.tooltip, className)}>
      <Icon
        name="info"
        size={16}
        color={colors.primary[100]}
        className={styles.icon}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <div
        className={cn(
          styles.content,
          styles[position],
          !isHovered && styles.hidden,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
