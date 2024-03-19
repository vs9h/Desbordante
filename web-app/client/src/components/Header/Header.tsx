import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import NavBar from '@components/NavBar';
import { useAuthContext } from '@hooks/useAuthContext';
import useModal from '@hooks/useModal';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './Header.module.scss';

const Header = () => {
  const { user, signOut } = useAuthContext();
  const { open: openLogInModal } = useModal('AUTH.LOG_IN');
  const { open: openSignUpModal } = useModal('AUTH.SIGN_UP');

  const [headerBackground, setHeaderBackground] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setHeaderBackground(window.scrollY > 64);
    };

    window.addEventListener('scroll', checkScroll);
    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  return (
    <header
      className={classNames(
        styles.header,
        headerBackground && styles.background,
      )}
    >
      <NavBar />
      <Button
        variant="secondary"
        size="sm"
        aria-label="open menu"
        icon={<Icon name="list" />}
        className={styles.menu}
      />
      <div className={styles.auth}>
        {user?.name ? (
          <>
            <p>Welcome, {user.name}</p>
            {!user.isVerified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openSignUpModal({})}
              >
                Verify Email
              </Button>
            )}
            <Button variant="secondary-danger" size="sm" onClick={signOut}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openLogInModal({})}
            >
              Log In
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => openSignUpModal({})}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
