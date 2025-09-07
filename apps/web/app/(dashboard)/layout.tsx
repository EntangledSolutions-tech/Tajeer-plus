import { use } from 'react';
import { cookies } from 'next/headers';
import { navigationConfig } from '~/config/navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { HomeMenuNavigation } from '../home/_components/home-menu-navigation';
import { HomeSidebar } from '../home/_components/home-sidebar';
import Image from 'next/image';

function DashboardLayout({ children }: React.PropsWithChildren) {
  return <SidebarLayout>{children}</SidebarLayout>;
}

export default withI18n(DashboardLayout);

function SidebarLayout({ children }: React.PropsWithChildren) {
  const [user] = use(Promise.all([requireUserInServerComponent()]));

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Full Height */}
      <div className="flex-shrink-0">
        <HomeSidebar user={user} />
      </div>

            {/* Right Content Area */}
      <div className="flex flex-col flex-1 min-w-0 relative bg-[#FBFBFB]">
        {/* Background Curve Image - Positioned at top-right */}
        <div className="absolute top-0 right-0 w-1/1 h-2/7 pointer-events-none">
          <Image
            src="/images/Dashboard pattern/Pattern [2x].png"
            alt="Background Pattern"
            fill
            className="object-top-right"
            priority
          />
        </div>

        {/* Top Navbar - Only spans content area width */}
        <div className="flex-shrink-0 relative z-10 bg-transparent">
          <HomeMenuNavigation />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative z-10 bg-transparent">
          <div className="px-6 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

async function getLayoutStyle() {
  const cookieStore = await cookies();
  return (
    (cookieStore.get('layout-style')?.value as 'sidebar' | 'header') ??
    'sidebar'
  );
}