import { useMutation } from '@apollo/client';
import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import { useTaskContext } from '@components/TaskContext';
import {
  downloadResults,
  downloadResultsVariables,
} from '@graphql/operations/mutations/__generated__/downloadResults';
import { DOWNLOAD_RESULTS } from '@graphql/operations/mutations/downloadResults';
import { FC } from 'react';
import { FileExtension, IntersectionFilter } from 'types/globalTypes';

interface Props {
  filter: IntersectionFilter;
  disabled?: boolean;
}

const removePagination = (filter: IntersectionFilter): IntersectionFilter => ({
  ...filter,
  pagination: null,
});

const DownloadResult: FC<Props> = ({ filter, disabled }) => {
  const { taskID } = useTaskContext();
  const [downloadResults, { loading }] = useMutation<
    downloadResults,
    downloadResultsVariables
  >(DOWNLOAD_RESULTS, {
    onCompleted: (data) => {
      const { url } = data.downloadResults;
      if (url) {
        window.open(url, '_blank');
      }
    },
    variables: {
      taskID,
      filter: removePagination(filter),
      props: {
        extension: FileExtension.CSV,
      },
    },
  });

  return (
    <Button
      icon={<Icon name="download" />}
      onClick={() => downloadResults()}
      disabled={loading || disabled}
    >
      Download
    </Button>
  );
};

export default DownloadResult;
