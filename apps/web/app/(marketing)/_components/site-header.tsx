import type { User } from '@supabase/supabase-js';

import { Header } from '@kit/ui/marketing';

import { AppLogo } from '~/components/app-logo';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

export function SiteHeader(props: { user?: User | null }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      <Header
        className="bg-transparent backdrop-blur-none"
        style={{ backgroundColor: 'transparent !important' }}
        logo={<AppLogo />}
        navigation={<SiteNavigation />}
        actions={<SiteHeaderAccountSection user={props.user ?? null} />}
      />
    </div>
  );
}
