import { FC, useLayoutEffect, useReducer, useRef } from 'react';
import Cross from '@assets/icons/cross.svg?component';
import styles from './MobileBanner.module.scss';

const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth <= 768;

const MobileBanner: FC = () => {
  const [hidden, hide] = useReducer(() => true, !isMobile());
  const initialStyles = useRef<{
    htmlOverflow: string;
    bodyOverflow: string;
  } | null>(null);

  useLayoutEffect(() => {
    if (!initialStyles.current) {
      initialStyles.current = {
        htmlOverflow: document.documentElement.style.overflow,
        bodyOverflow: document.body.style.overflow,
      };
    }

    if (hidden) {
      const { htmlOverflow, bodyOverflow } = initialStyles.current;
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    } else {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
  }, [hidden]);

  const banner = (
    <div className={styles.root}>
      <small>
        The mobile version is under development. Some functions may be
        unavailable.
      </small>
      <button aria-label="close" className={styles.close} onClick={hide}>
        <Cross className={styles.cross} />
      </button>
    </div>
  );

  return hidden ? null : banner;
};

export default MobileBanner;
