import { useRouter } from 'next/router';
import TabsLayout from '@components/TabsLayout';
import tabs from 'src/routes/AdminPanel/tabs';
import { NextPageWithLayout } from 'types/pageWithLayout';

const AdminPanel: NextPageWithLayout = () => {
  const router = useRouter();

  const currentTab =
    tabs.find((tab) => router.query.tab === tab.pathname) ?? tabs[0];

  const Component = currentTab.component;

  return (
    <TabsLayout
      tabs={tabs}
      selectedTab={currentTab.pathname}
      onTabSelect={(pathname) => router.push(`/admin-panel/${pathname}`)}
    >
      <Component />
    </TabsLayout>
  );
};

export default AdminPanel;
