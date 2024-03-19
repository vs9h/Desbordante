import UnidataLogo from '@assets/images/unidata-logo.svg?component';
import { Icon } from '@components/IconComponent';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Button from '../components/Button';
import ExternalLink from '../components/ExternalLink';
import styles from '../styles/Home.module.scss';

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.root}>
      <Icon name="backgroundHome" className={styles.background} />

      <div className={styles.hero}>
        <div className={styles.content}>
          <h1 className={styles.name}>Desbordante</h1>
          <h6 className={styles.description}>
            Open-source data profiling tool{' '}
            <span className={styles.supported}>
              supported by
              <a
                className={styles.unidataLogo}
                href="https://universe-data.ru"
                target="_blank"
                rel="noreferrer"
                title="Universe Data"
              >
                <UnidataLogo width={144} height={48} />
              </a>
            </span>
          </h6>
          <div className={styles.links}>
            <Button
              variant="gradient"
              onClick={() => router.push('/create-task/choose-primitive')}
            >
              Get Started
            </Button>
            <div className={styles.external}>
              <ExternalLink href="https://github.com/Mstrutov/Desbordante">
                GitHub
              </ExternalLink>
              <ExternalLink href="https://mstrutov.github.io/Desbordante">
                User Guide
              </ExternalLink>
            </div>
          </div>
        </div>
        <div className={styles.videoContainer}>
          <video autoPlay muted loop>
            <source src="/hero-animation.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </div>
  );
};

export default Home;
