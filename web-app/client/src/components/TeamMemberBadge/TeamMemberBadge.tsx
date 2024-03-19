import { Icon } from '@components/IconComponent';
import colors from '@constants/colors';
import { getTeamMembers_teamMembers_data_attributes } from '@graphql/operations/queries/__generated__/getTeamMembers';
import { cmsUrlWrapper } from '@utils/cmsUrlWrapper';
import { FC } from 'react';
import styles from './TeamMemberBadge.module.scss';

type TeamMemberAttributes = getTeamMembers_teamMembers_data_attributes;

interface Props {
  data: TeamMemberAttributes;
}

const TeamMemberBadge: FC<Props> = ({ data }) => {
  const links = data.links?.data;

  return (
    <li className={styles.teamMemberBadge}>
      <div className={styles.header}>
        <h6>
          {data.fullName}{' '}
          {data.isActive && (
            <span title="Active member">
              <Icon name="desbordante" color={colors.primary[100]} size={16} />
            </span>
          )}
        </h6>
        <small>{data.position}</small>
      </div>
      {data.description && (
        <small className={styles.description}>{data.description}</small>
      )}
      {links && links.length > 0 && (
        <ul className={styles.links}>
          {links.map(({ id, attributes }) => {
            const platformAttributes = attributes?.platform?.data?.attributes;

            if (!platformAttributes) {
              return null;
            }

            const imagePath = platformAttributes.icon.data?.attributes?.url;
            const imageSrc = imagePath && cmsUrlWrapper(imagePath);

            return (
              <li key={id}>
                <a
                  href={attributes?.href}
                  title={platformAttributes.title}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={imageSrc} alt="" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default TeamMemberBadge;
