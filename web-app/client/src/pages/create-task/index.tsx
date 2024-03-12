import { GetServerSideProps, NextPage } from 'next';

const CreateTask: NextPage = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/create-task/choose-primitive',
      permanent: true,
    },
  };
};

export default CreateTask;
