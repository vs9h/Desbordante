import { ApolloProvider } from '@apollo/client';
import { AuthContextProvider } from '@components/AuthContext';
import { ErrorContextProvider } from '@components/ErrorContext';
import Layout from '@components/Layout';
import { ToastContainer } from '@components/Toast';
import client from '@graphql/client';
import '@styles/globals.scss';
import { AppPropsWithLayout } from 'types/pageWithLayout';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ApolloProvider client={client}>
      <ErrorContextProvider>
        <AuthContextProvider>
          <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
          <ToastContainer />
        </AuthContextProvider>
      </ErrorContextProvider>
    </ApolloProvider>
  );
}

export default MyApp;
