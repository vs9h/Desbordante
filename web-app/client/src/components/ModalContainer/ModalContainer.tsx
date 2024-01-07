import cn from 'classnames';
import { useEffect, useRef } from 'react';
import { animated, useSpring } from 'react-spring';
import CloseIcon from '@assets/icons/cross.svg?component';
import { FCWithChildren } from 'types/react';
import styles from './ModalContainer.module.scss';

export interface ModalProps {
  onClose?: () => void;
  className?: string;
}

const ModalContainer: FCWithChildren<ModalProps> = ({
  children,
  className,
  onClose = () => null,
}) => {
  const backgroundFadeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const backgroundFadeProps = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      tension: 300,
    },
  });

  const containerProps = useSpring({
    reset: true,
    from: {
      opacity: 0,
      transform: 'translate3d(0, 3%, 0)',
    },
    to: [
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      { transform: 'none', config: { immediate: true } },
    ],
    config: {
      tension: 300,
    },
  });

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        !backgroundFadeRef.current ||
        !containerRef.current ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      if (
        backgroundFadeRef.current.contains(event.target) &&
        !containerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  useEffect(() => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, []);

  return (
    <animated.div
      className={styles.backgroundFade}
      style={backgroundFadeProps}
      ref={backgroundFadeRef}
    >
      <animated.div
        className={cn(className, styles.container)}
        style={containerProps}
        ref={containerRef}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className={styles.closeButton}
        >
          <CloseIcon width={24} height={24} />
        </button>
        <>{children}</>
      </animated.div>
    </animated.div>
  );
};

export default ModalContainer;
