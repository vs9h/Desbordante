import { FC } from 'react';
import ModalContainer, { ModalProps } from '@components/ModalContainer';
import { AllowedDataset } from 'types/algorithms';
import styles from './FilePropertiesModal.module.scss';
import { FilePropsList } from '@components/FilePropertiesModal/tabs/PropertiesTab';

type Props = ModalProps & { data: AllowedDataset };

const FilePropertiesModal: FC<Props> = ({ onClose, ...props }) => {
  return (
    <ModalContainer onClose={onClose}>
      <h4 className={styles.header}>File Properties</h4>
      <FilePropsList {...props} />
    </ModalContainer>
  );
};

export default FilePropertiesModal;
