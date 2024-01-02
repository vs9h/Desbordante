import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import ChartIcon from '@assets/icons/chart.svg?component';

export type TabConfig = {
  pathname: string;
  label: string;
  icon: ReactNode;
  component: ComponentType;
};

const SystemStatusComponent = dynamic(() => import('./SystemStatus'), {
  ssr: false,
});

const tabs: TabConfig[] = [
  {
    pathname: 'system-status',
    label: 'System Status',
    icon: <ChartIcon />,
    component: SystemStatusComponent,
  },
];

export default tabs;
