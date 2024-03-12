import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import ChartIcon from '@assets/icons/chart.svg?component';
import GearIcon from '@assets/icons/gear.svg?component';
import FileIcon from '@assets/icons/file.svg?component';
import UserIcon from '@assets/icons/user.svg?component';

export type TabConfig = {
  pathname: string;
  label: string;
  icon: ReactNode;
  component: ComponentType;
};

const SystemStatusComponent = dynamic(() => import('./SystemStatus'), {
  ssr: false,
});

const TasksOverviewComponent = dynamic(() => import('./TasksOverview'), {
  ssr: false,
});

const FilesOverviewComponent = dynamic(() => import('./FilesOverview'), {
  ssr: false,
});

const UsersOverviewComponent = dynamic(() => import('./UsersOverview'), {
  ssr: false,
});

const tabs: TabConfig[] = [
  {
    pathname: 'system-status',
    label: 'System Status',
    icon: <ChartIcon />,
    component: SystemStatusComponent,
  },
  {
    pathname: 'tasks-overview',
    label: 'Tasks Overview',
    icon: <GearIcon />,
    component: TasksOverviewComponent,
  },
  {
    pathname: 'files-overview',
    label: 'Files Overview',
    icon: <FileIcon />,
    component: FilesOverviewComponent,
  },
  {
    pathname: 'users-overview',
    label: 'Users Overview',
    icon: <UserIcon />,
    component: UsersOverviewComponent,
  },
];

export default tabs;
