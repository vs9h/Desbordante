import { Icon } from '@components/IconComponent';
import { FC } from 'react';
import {
  ToastContainerProps,
  ToastContainer as TostifyToastContainer,
  CloseButtonProps,
} from 'react-toastify';
import styles from './ToastContainer.module.scss';

const CloseButton: FC<CloseButtonProps> = ({ closeToast, ariaLabel }) => (
  <button onClick={closeToast} aria-label={ariaLabel} className={styles.close}>
    <Icon name="cross" />
  </button>
);

export const ToastContainer: FC<ToastContainerProps> = (props) => (
  <TostifyToastContainer
    position="bottom-right"
    draggable={false}
    className={styles.wrapper}
    closeOnClick={false}
    icon={false}
    closeButton={CloseButton}
    autoClose={4000}
    {...props}
  />
);
