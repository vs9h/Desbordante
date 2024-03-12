import { FC, useState } from 'react';
import styles from './DatasetItem.module.scss';
import Button from '@components/Button';
import moment from 'moment';
import { getDatasetsInfo_datasets } from '@graphql/operations/queries/__generated__/getDatasetsInfo';
import prettyBytes from 'pretty-bytes';
import FileIcon from '@assets/icons/file.svg?component';
import { FilePropsList } from '@components/FilePropertiesModal/tabs/PropertiesTab';
import ModalContainer from '@components/ModalContainer';
import FilePropertiesModal from '../FilePropertiesModal';

interface Props {
  data: getDatasetsInfo_datasets;
}

const DatasetItem: FC<Props> = ({ data }) => {
  const {
    originalFileName,
    fileFormat,
    fileSize,
    createdAt,
    user,
    numberOfUses,
  } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <li className={styles.datasetItem}>
      <div className={styles.iconContainer}>
        <FileIcon className={styles.icon} />
      </div>
      <div className={styles.middle}>
        <div className={styles.top}>
          <div className={styles.fileName}>{originalFileName}</div>
          <div className={styles.fileType}>{fileFormat?.inputFormat}</div>
          <div className={styles.numberOfUses}>{numberOfUses} uses</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.size}>{prettyBytes(fileSize)}</div>
          <div className={styles.createdAt}>
            {moment(+createdAt).format('[Uploaded] L LT')}
          </div>
          <div className={styles.user}>{user?.fullName ?? 'Anonymous'}</div>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsModalOpen(true)}
      >
        Properties
      </Button>
      {isModalOpen && (
        <FilePropertiesModal
          data={data}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </li>
  );
};

export default DatasetItem;
