import { Icon } from '@components/IconComponent';
import useModal from '@hooks/useModal';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import classNames from 'classnames';
import { formatDistance } from 'date-fns';
import { FC, PropsWithChildren } from 'react';
import '@formatjs/intl-numberformat/polyfill';
import '@formatjs/intl-numberformat/locale-data/en';
import { AllowedDataset } from 'types/algorithms';
import styles from './DatasetCard.module.scss';
interface BaseCardProps extends PropsWithChildren {
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const getFileDescription = (file: AllowedDataset) => {
  const formatter = new Intl.NumberFormat('en', { notation: 'compact' });
  const rowsCount = formatter.format(file.rowsCount);
  const countOfColumns = formatter.format(file.countOfColumns || 0);
  const range = formatDistance(new Date(+file.createdAt), new Date(), {
    addSuffix: true,
  });
  const usedTimes = file.numberOfUses;
  return [
    `${rowsCount} rows, ${countOfColumns} columns`,
    file.isBuiltIn ? `Used ${usedTimes} times` : `Uploaded ${range}`,
  ];
};

const BaseCard: FC<BaseCardProps> = ({
  children,
  isSelected = false,
  isDisabled = false,
  ...rest
}) => {
  return (
    <div
      className={classNames(
        styles.card,
        isSelected && styles.selected,
        isDisabled && styles.disabled,
      )}
      title={
        isDisabled
          ? 'This file is not supported by selected feature'
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
};

interface DatasetCardProps {
  file: AllowedDataset;
}

export const DatasetCard: FC<DatasetCardProps> = ({ file }) => {
  const { primitive, fileID } = useTaskUrlParams();
  const descriptionList = getFileDescription(file);
  const fileName = file.originalFileName;
  const { open: openFilePropertiesModal } = useModal('FILE_PROPERTIES');
  const isDisabled =
    !primitive.value || !file.supportedPrimitives.includes(primitive.value);

  return (
    <BaseCard
      isSelected={fileID.value === file.fileID}
      onClick={isDisabled ? undefined : () => fileID.set(file.fileID)}
      isDisabled={isDisabled}
    >
      <div className={styles.cardTitle}>
        <p title={fileName}>{fileName}</p>
        <Icon
          name="threeDots"
          size={20}
          onClick={() =>
            openFilePropertiesModal({ fileID: file.fileID, data: file })
          }
        />
      </div>
      <div className={styles.cardDescription}>
        <span>{descriptionList.join('\n')}</span>
      </div>
    </BaseCard>
  );
};
