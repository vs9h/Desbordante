import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { googleAnalyticsKey } from '@utils/env';
import { pageView } from '@utils/googleAnalytics';

const GoogleAnalytics = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageView(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('hashChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('hashChangeComplete', handleRouteChange);
    };
  }, [router?.events]);

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsKey}`}
      />
      <script
        async
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsKey}', {
              page_path: window.location.pathname,
            });`,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
