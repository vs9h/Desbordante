import { GetServerSideProps, NextPage } from 'next';
import tabs from 'src/routes/AdminPanel/tabs';

const AdminPanel: NextPage = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `/admin-panel/${tabs[0].pathname}`,
      permanent: true,
    },
  };
};

export default AdminPanel;
