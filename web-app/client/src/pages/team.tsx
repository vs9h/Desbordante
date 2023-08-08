import { GetServerSideProps, NextPage } from 'next';
import HomeBackground from '@assets/backgrounds/home.svg?component';
import TeamMemberBadge from '@components/TeamMemberBadge';
import cmsClient from '@graphql/cmsClient';
import { getTeamMembers } from '@graphql/operations/queries/__generated__/getTeamMembers';
import { GET_TEAM_MEMBERS } from '@graphql/operations/queries/getTeamMembers';
import styles from '@styles/Team.module.scss';

interface Props {
  team: getTeamMembers;
}

const Team: NextPage<Props> = ({ team }) => {
  const { teamMembers } = team;

  return (
    <div className={styles.teamPage}>
      <HomeBackground
        className={styles.background}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      />

      {teamMembers && teamMembers.data && teamMembers.data.length > 0 && (
        <ol className={styles.teamCardsContainer}>
          {teamMembers.data.map(
            ({ id, attributes }) =>
              attributes && <TeamMemberBadge data={attributes} key={id} />
          )}
        </ol>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { data } = await cmsClient.query<getTeamMembers>({
    query: GET_TEAM_MEMBERS,
  });

  return {
    props: {
      team: data,
    },
  };
};

export default Team;