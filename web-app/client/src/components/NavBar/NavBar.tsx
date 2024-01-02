import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useRef } from 'react';
import { useAuthContext } from '@hooks/useAuthContext';
import logo from '@public/logo.svg';
import { User } from 'types/auth';
import styles from './NavBar.module.scss';

type Route = {
  label: string;
  pathname: string;
  resolver?: (user?: User) => boolean;
};

const routes: Route[] = [
  {
    label: 'Discover',
    pathname: '/create-task',
  },
  {
    label: 'Papers',
    pathname: '/papers',
  },
  {
    label: 'Team',
    pathname: '/team',
  },
  {
    label: 'Admin Panel',
    pathname: '/admin-panel',
    resolver: (user) => Boolean(user?.permissions.canViewAdminInfo),
  },
];

const NavBar: FC = () => {
  const widths = useRef<Map<string, number>>(new Map());
  const router = useRouter();
  const { user } = useAuthContext();

  const selectedRouteIndex = routes.findIndex(({ pathname }) =>
    router.pathname.includes(pathname),
  );

  return (
    <nav className={styles.navBar}>
      <ul className={styles.itemsContainer}>
        <li>
          <Link href="/" className={styles.brand}>
            <Image
              src={logo}
              alt="Logo"
              className={styles.logo}
              width={39.5}
              height={40}
            />
            Desbordante
          </Link>
        </li>

        {routes
          .filter(({ resolver }) => resolver?.(user) ?? true)
          .map(({ label, pathname }, index) => (
            <li
              key={pathname}
              className={cn(
                styles.underline,
                index === selectedRouteIndex && styles.selected,
              )}
              ref={(node) => {
                if (node) {
                  widths.current.set(pathname, node.offsetWidth);
                }
              }}
              style={{ width: widths.current.get(pathname) }}
            >
              <Link href={pathname}>{label}</Link>
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default NavBar;
