import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import PrimitiveCard from '@components/PrimitiveCard';
import PrimitiveDescription from '@components/PrimitiveDescription';
import WizardLayout from '@components/WizardLayout';
import primitiveInfo from '@constants/primitiveInfoType';
import { useTaskUrlParams } from '@hooks/useTaskUrlParams';
import styles from '@styles/ChoosePrimitive.module.scss';
import { useRouter } from 'next/router';
import { MainPrimitiveType } from 'types/globalTypes';

const header = (
  <>
    <h2 className={styles.pageName}>Select a Feature</h2>
    <h6 className={styles.pageDescription}>
      We are working on new features and properties{' '}
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          window.open(
            'https://github.com/Mstrutov/Desbordante/issues/new',
            '_blank',
            'noreferrer',
          )
        }
      >
        Request a Feature
      </Button>
    </h6>
  </>
);

const ChoosePrimitive = () => {
  const router = useRouter();
  const { primitive } = useTaskUrlParams();

  const footer = (
    <Button
      variant="primary"
      icon={<Icon name="file" />}
      disabled={!primitive.value}
      onClick={() =>
        router.push({
          pathname: '/create-task/choose-file',
          query: router.query,
        })
      }
    >
      Choose a File
    </Button>
  );

  return (
    <WizardLayout header={header} footer={footer}>
      <article className={styles.root}>
        <ul className={styles.inputsContainer}>
          {Object.entries(primitiveInfo).map(([primitiveCode, info]) => (
            <PrimitiveCard
              key={primitiveCode}
              name={primitiveCode}
              info={info}
              isSelected={primitive.value === primitiveCode}
              onChange={(event) =>
                primitive.set(event.currentTarget.value as MainPrimitiveType)
              }
            />
          ))}
        </ul>

        {primitive.value && (
          <PrimitiveDescription
            className={styles.descriptionAside}
            info={
              primitiveInfo[primitive.value] || {
                label: 'Loading',
                description: '',
              }
            }
          />
        )}
      </article>
    </WizardLayout>
  );
};

export default ChoosePrimitive;
