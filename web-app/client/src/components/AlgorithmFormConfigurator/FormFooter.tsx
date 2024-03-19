import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import { NextRouter } from 'next/router';
import React from 'react';

const FormFooter = (router: NextRouter, onSubmit: () => Promise<void>) => (
  <>
    <Button
      variant="secondary"
      onClick={() =>
        router.push({
          pathname: '/create-task/choose-file',
          query: router.query,
        })
      }
    >
      Go Back
    </Button>
    <Button variant="primary" icon={<Icon name="idea" />} onClick={onSubmit}>
      Analyze
    </Button>
  </>
);

export default FormFooter;
