import { FC, useEffect, useState } from 'react';
import { Text } from '@components/Inputs';
import styles from './UsersOverview.module.scss';
import Button from '@components/Button';
import FilterIcon from '@assets/icons/filter.svg?component';
import OrderingIcon from '@assets/icons/ordering.svg?component';
import EmailIcon from '@assets/icons/email.svg?component';
import FiltersModal from './components/FiltersModal';
import EmailModal from './components/EmailModal';
import { Moment } from 'moment';
import { FormProvider, useForm } from 'react-hook-form';
import {
  OrderDirection,
  Pagination as PagionationType,
  UsersQueryFilters,
  UsersQueryOrderingParameter,
} from 'types/globalTypes';
import OrderingModal from './components/OrderingModal';
import { useLazyQuery } from '@apollo/client';
import UserItem from './components/UserItem';
import useFormPersist from '@hooks/useFormPersist';
import moment from 'moment';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { GET_USERS_INFO } from '@graphql/operations/queries/getUsersInfo';
import {
  getUsersInfo,
  getUsersInfoVariables,
} from '@graphql/operations/queries/__generated__/getUsersInfo';

export type Filters = {
  searchString?: string;
  country?: string;
  period: [Moment | undefined, Moment | undefined];
  includeDeleted: boolean;
};

const defaultFilters: Filters = {
  searchString: undefined,
  country: undefined,
  period: [undefined, undefined],
  includeDeleted: false,
};

export type Ordering = {
  parameter: UsersQueryOrderingParameter;
  direction: OrderDirection;
};

const defaultOrdering: Ordering = {
  parameter: UsersQueryOrderingParameter.CREATION_TIME,
  direction: OrderDirection.DESC,
};

export type SendMessageData = {
  recepients: 'all' | 'custom';
  to: string[];
  subject: string;
  body: string;
};

const defaultSendMessageValues: SendMessageData = {
  recepients: 'all',
  to: [],
  subject: '',
  body: '',
};

const defaultPagination: PagionationType = {
  limit: 10,
  offset: 0,
};

const filtersToApi = (filters: Filters): UsersQueryFilters => ({
  ..._.omit(filters, ['searchString', 'period']),
  fullName: filters.searchString || undefined,
  registrationTime: filters.period.some(Boolean)
    ? {
        from: filters.period[0]?.toISOString() ?? undefined,
        to: filters.period[1]?.toISOString() ?? undefined,
      }
    : undefined,
});

const UsersOverview: FC = () => {
  const router = useRouter();
  const filterMethods = useForm({ defaultValues: defaultFilters });
  const orderingMethods = useForm({ defaultValues: defaultOrdering });
  const sendMessageMethods = useForm({
    defaultValues: defaultSendMessageValues,
  });

  const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);
  const [isOrderingModalShown, setIsOrderingModalShown] = useState(false);
  const [isEmailModalShown, setIsEmailModalShown] = useState(false);

  useFormPersist(`${router.asPath}-filters`, {
    ...filterMethods,
    transformValues: {
      period: (value) => value.map((v: any) => (v ? moment(v) : undefined)),
    },
  });

  useFormPersist(`${router.asPath}-ordering`, {
    ...orderingMethods,
  });

  const [query, { data }] = useLazyQuery<getUsersInfo, getUsersInfoVariables>(
    GET_USERS_INFO,
  );

  const doQuery = () => {
    query({
      variables: {
        props: {
          filters: filtersToApi(filterMethods.watch()),
          ordering: orderingMethods.watch(),
          pagination: {
            limit: 100,
            offset: 0,
          },
        },
      },
    });
  };

  const searchString = filterMethods.watch('searchString');

  useEffect(() => {
    doQuery();
  }, [searchString]);

  return (
    <div className={styles.usersOverviewTab}>
      <h5 className={styles.title}>Users Overview</h5>
      <div className={styles.settingsRow}>
        <Text
          size={15}
          label="Search"
          placeholder="Search string or regex"
          {...filterMethods.register('searchString')}
        />
        <Button
          variant="secondary"
          icon={<FilterIcon />}
          onClick={() => setIsFiltersModalShown(true)}
        >
          Filters
        </Button>
        <Button
          variant="secondary"
          icon={<OrderingIcon />}
          onClick={() => setIsOrderingModalShown(true)}
        >
          Ordering
        </Button>
        <Button
          variant="secondary"
          className={styles.emailButton}
          icon={<EmailIcon />}
          onClick={() => setIsEmailModalShown(true)}
        >
          Send Email
        </Button>
      </div>
      <ul className={styles.itemsList}>
        {data?.users?.map((item) => (
          <UserItem
            data={item}
            key={item.userID}
            onSendEmail={() => {
              sendMessageMethods.reset({
                recepients: 'custom',
                to: [item.email],
              });
              setIsEmailModalShown(true);
            }}
          />
        ))}
      </ul>
      <FormProvider {...filterMethods}>
        {isFiltersModalShown && (
          <FiltersModal
            onClose={() => setIsFiltersModalShown(false)}
            onApply={doQuery}
          />
        )}
      </FormProvider>
      <FormProvider {...orderingMethods}>
        {isOrderingModalShown && (
          <OrderingModal
            onClose={() => setIsOrderingModalShown(false)}
            onApply={doQuery}
          />
        )}
      </FormProvider>

      <FormProvider {...sendMessageMethods}>
        {isEmailModalShown && (
          <EmailModal onClose={() => setIsEmailModalShown(false)} />
        )}
      </FormProvider>
    </div>
  );
};

export default UsersOverview;
