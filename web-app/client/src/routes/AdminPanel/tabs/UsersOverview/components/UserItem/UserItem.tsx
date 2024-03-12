import { FC, useState } from 'react';
import styles from './UserItem.module.scss';
import Button from '@components/Button';
import moment from 'moment';
import { getUsersInfo_users } from '@graphql/operations/queries/__generated__/getUsersInfo';
import UserIcon from '@assets/icons/user.svg?component';
import { countries } from 'countries-list';

const countryNames = Object.entries(countries).map(([, country]) => country);

interface Props {
  data: getUsersInfo_users;
  onSendEmail: () => void;
}

const UserItem: FC<Props> = ({
  data: {
    companyOrAffiliation,
    country,
    createdAt,
    email,
    fullName,
    occupation,
    userID,
  },
  onSendEmail
}) => {
  const countryEntry = countryNames.find((item) => item.name === country);

  return (
    <li className={styles.userItem}>
      <div className={styles.iconContainer}>
        <UserIcon className={styles.icon} />
      </div>
      <div className={styles.middle}>
        <div className={styles.top}>
          <div className={styles.fileName}>{fullName}</div>
          <div className={styles.fileType}>{occupation} at {companyOrAffiliation}</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.country}><span className={styles.flag}>{countryEntry?.emoji}</span> {countryEntry?.name}</div>
          <div className={styles.createdAt}>
            {moment(+createdAt).format('[Created] L LT')}
          </div>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onSendEmail}
      >
        Send email
      </Button>
    </li>
  );
};

export default UserItem;
