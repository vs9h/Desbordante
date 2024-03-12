import cn from 'classnames';
import { useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import CloseIcon from '@assets/icons/close.svg?component';
import OutsideClickObserver from '@components/OutsideClickObserver';
import { FCWithChildren } from 'types/react';
import styles from './ModalContainer.module.scss';

const AnimatedOutsideClickObserver = animated(OutsideClickObserver);

export interface ModalProps {
  onClose?: () => void;
  className?: string;
}

const ModalContainer: FCWithChildren<ModalProps> = ({
  children,
  className,
  onClose = () => null,
}) => {
  const backgroundFadeProps = useSpring({
    // from: {
    //   opacity: 0,
    // },
    // to: {
    //   opacity: 1,
    // },
    // config: {
    //   tension: 300,
    // },
  });

  const containerProps = useSpring({
    // from: {
    //   opacity: 0,
    //   transform: 'translate3d(0, 3%, 0)',
    // },
    // to: [
    //   {
    //     opacity: 1,
    //     transform: 'translate3d(0, 0, 0)',
    //   },
    //   {
    //     transform: 'none',
    //     immediate: true,
    //   },
    // ],
    // config: {
    //   tension: 300,
    // },
  });

  useEffect(() => {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
      return;
    }

    activeElement.blur();

    return () => activeElement.focus();
  }, []);

  return (
    <animated.div className={styles.backgroundFade} style={backgroundFadeProps}>
      <AnimatedOutsideClickObserver
        className={cn(className, styles.container)}
        style={containerProps}
        onClickOutside={onClose}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className={styles.closeButton}
        >
          <CloseIcon width={24} height={24} />
        </button>
        <>{children}</>
      </AnimatedOutsideClickObserver>
    </animated.div>
  );
};

export default ModalContainer;
