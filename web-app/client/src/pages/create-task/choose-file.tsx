import cn from 'classnames';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import SettingsIcon from '@assets/icons/settings.svg?component';
import Button from '@components/Button';
import { Collapse } from '@components/Collapse';
import { DatasetCard } from '@components/DatasetCard';
import { DatasetUploader } from '@components/DatasetUploader';
import WizardLayout from '@components/WizardLayout';
import client from '@graphql/client';
import { getAlgorithmsConfig } from '@graphql/operations/queries/__generated__/getAlgorithmsConfig';
import { GET_ALGORITHMS_CONFIG } from '@graphql/operations/queries/getAlgorithmsConfig';
import { useAuthContext } from '@hooks/useAuthContext';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ChooseFile.module.scss';
import { AllowedDataset } from 'types/algorithms';
import { MainPrimitiveType } from 'types/globalTypes';

const sortDatasetsBySupportedPrimitive = (
  datasets?: AllowedDataset[],
  primitive?: MainPrimitiveType,
) =>
  datasets &&
  primitive &&
  datasets.sort(
    (a, b) =>
      Number(b.supportedPrimitives.includes(primitive)) -
      Number(a.supportedPrimitives.includes(primitive)),
  );

type Props = {
  defaultAlgorithmConfig: getAlgorithmsConfig | null;
};

const ChooseFile: NextPage<Props> = ({ defaultAlgorithmConfig }) => {
  const router = useRouter();
  const { primitive, fileID } = useTaskUrlParams();
  const { user, refreshUserData } = useAuthContext();

  const userDatasets = useMemo(
    () => sortDatasetsBySupportedPrimitive(user?.datasets, primitive.value),
    [primitive.value, user?.datasets],
  );
  const builtinDatasets = useMemo(
    () =>
      sortDatasetsBySupportedPrimitive(
        defaultAlgorithmConfig?.algorithmsConfig?.allowedDatasets,
        primitive.value,
      ),
    [
      defaultAlgorithmConfig?.algorithmsConfig?.allowedDatasets,
      primitive.value,
    ],
  );

  //удалить, когда будет бэк
  if (
    defaultAlgorithmConfig?.algorithmsConfig?.allowedDatasets[0][
      'supportedPrimitives'
    ].at(-1) !== MainPrimitiveType.AFD
  ) {
    defaultAlgorithmConfig?.algorithmsConfig?.allowedDatasets[0][
      'supportedPrimitives'
    ].push(MainPrimitiveType.AFD);
  }

  const selectedDataset = useMemo(
    () =>
      builtinDatasets
        ?.concat(userDatasets || [])
        .find(
          (dataset) =>
            primitive.value &&
            dataset.supportedPrimitives.includes(primitive.value) &&
            dataset.fileID === fileID.value,
        ),
    [builtinDatasets, fileID.value, primitive.value, userDatasets],
  );

  useEffect(() => {
    if (!selectedDataset) {
      fileID.set('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataset]);

  if (router.isReady && !primitive.value) {
    router.push({
      pathname: '/create-task/choose-primitive',
      query: router.query,
    });

    return null;
  }

  const userFiles = (
    <Collapse title="My Files" className={styles.title}>
      {(user?.permissions.canUploadFiles && (
        <div className={styles.files}>
          <DatasetUploader
            onUpload={(dataset) => {
              refreshUserData();
              fileID.set(dataset.fileID);
            }}
          />

          {user?.permissions.canUploadFiles &&
            userDatasets &&
            userDatasets.map((file) => (
              <DatasetCard key={file.fileID} file={file} />
            ))}
        </div>
      )) || <p>You must be authorized to upload files</p>}
    </Collapse>
  );

  const builtinFiles = (
    <Collapse title="Built-in Datasets" className={styles.title}>
      <div className={styles.files}>
        {user?.permissions.canUseBuiltinDatasets &&
          builtinDatasets &&
          builtinDatasets.map((file) => (
            <DatasetCard key={file.fileID} file={file} />
          ))}
      </div>
    </Collapse>
  );

  const header = (
    <>
      <h2 className={styles.name_main}>Choose a File</h2>
      <h6 className={styles.description}>
        We have prepared some datasets for you
      </h6>
    </>
  );

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          router.push({
            pathname: '/create-task/choose-primitive',
            query: router.query,
          })
        }
      >
        Go Back
      </Button>
      <Button
        disabled={!selectedDataset}
        variant="primary"
        icon={<SettingsIcon />}
        onClick={() =>
          router.push({
            pathname: '/create-task/configure-algorithm',
            query: router.query,
          })
        }
      >
        Configure algorithm
      </Button>
    </>
  );

  return (
    <WizardLayout
      header={header}
      footer={footer}
      className={cn(
        styles.content,
        !user?.permissions.canUploadFiles && styles.reversed,
      )}
    >
      {userFiles}
      {builtinFiles}
    </WizardLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { data: defaultAlgorithmConfig } = await client.query({
    query: GET_ALGORITHMS_CONFIG,
    fetchPolicy: 'no-cache',
  });

  return {
    props: { defaultAlgorithmConfig },
  };
};

export default ChooseFile;
