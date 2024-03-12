import React, { FC, useEffect, useMemo, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { Text, TextArea } from '@components/Inputs';
import styles from './EmailModal.module.scss';
import {
  OrderDirection,
  UsersQueryOrderingParameter,
} from 'types/globalTypes';
import ModalContainer from '@components/ModalContainer';
import { ControlledSelect } from '@components/Inputs/Select';
import { ControlledSelect as ControlledMultiSelect } from '@components/Inputs/MultiSelect';
import Button from '@components/Button';
import { useMutation, useQuery } from '@apollo/client';
import { SEND_MESSAGE } from '@graphql/operations/mutations/sendMessage';
import {
  sendMessage,
  sendMessageVariables,
} from '@graphql/operations/mutations/__generated__/sendMessage';
import {
  getUsersInfo,
  getUsersInfoVariables,
} from '@graphql/operations/queries/__generated__/getUsersInfo';
import { GET_USERS_INFO } from '@graphql/operations/queries/getUsersInfo';
import { showError, showSuccess, showToast } from '@utils/toasts';
import { SendMessageData } from '../../UsersOverview';

const recepientsOptions = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Custom',
    value: 'custom',
  },
];

const processResponse = (data: sendMessage) => {
  const { status, accepted, rejected } = data.sendMessage;

  if (status === 'ERROR' || !rejected || !accepted) {
    showError('Error when sending messages', 'No messages have been sent');
    return;
  }

  if (rejected?.length === 0) {
    showSuccess('Messages sent successfully', `${accepted.length} messages have been sent`);
    return;
  }

  showToast('Messages have been partially sent', `Error when sending messages to ${rejected.join(', ')}`);
};

interface Props {
  onClose: () => void;
}

const EmaiModal: FC<Props> = ({ onClose }) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<SendMessageData>();
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery<getUsersInfo, getUsersInfoVariables>(
    GET_USERS_INFO,
    {
      variables: {
        props: {
          filters: {},
          ordering: {
            parameter: UsersQueryOrderingParameter.CREATION_TIME,
            direction: OrderDirection.DESC,
          },
          pagination: { limit: 100, offset: 0 },
        },
      },
    },
  );

  const [sendMessage] = useMutation<sendMessage, sendMessageVariables>(
    SEND_MESSAGE,
  );

  const userEmailOptions = useMemo(
    () =>
      data?.users.map(({ email }) => ({
        label: email,
        value: email,
      })) ?? [],
    [data?.users],
  );

  const recepients = watch('recepients');

  useEffect(() => {
    if (recepients === 'all') {
      setValue('to', []);
    }
  }, [recepients]);

  const onSubmit = handleSubmit(async ({ recepients, to, subject, body }) => {
    setIsLoading(true);

    try {
      const { data } = await sendMessage({
        variables: {
          userIDs: recepients === 'custom' ? to : undefined,
          messageData: {
            subject,
            body,
          },
        },
      });

      if (data) {
        processResponse(data);
      }

      onClose?.();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <ModalContainer onClose={onClose}>
      <form onSubmit={onSubmit}>
        <h4 className={styles.title}>Send Email</h4>
        <div className={styles.inputs}>
          <ControlledSelect
            control={control}
            controlName="recepients"
            options={recepientsOptions}
            label="Recepients"
          />
          {recepients === 'custom' && (
            <ControlledMultiSelect
              control={control}
              controlName="to"
              options={userEmailOptions}
              isSearchable
              label="To"
            />
          )}
          <Text
            label="Subject"
            {...register('subject', {
              required: 'Required field',
            })}
            error={errors.subject?.message}
          />
          <TextArea
            label="Body"
            {...register('body', {
              required: 'Required field',
            })}
            error={errors.body?.message}
          />
        </div>
        <div className={styles.buttons}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default EmaiModal;
