import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import styles from '@styles/404.module.scss';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const _404: NextPage = () => {
  const { push } = useRouter();

  return (
    <div className={styles.wrapper}>
      <Icon name="background404" className={styles.background} />
      <div className={styles.inner}>
        <h1>404</h1>
        <h5>Page not found</h5>
        <p>The page you are trying to locate does not exist</p>
      </div>
      <Button variant="secondary" onClick={() => push('/')}>
        Go to Home Page
      </Button>
    </div>
  );
};

export default _404;
