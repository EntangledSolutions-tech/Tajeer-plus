import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/config/app.config';

export function SiteFooter() {
  return (
    <Footer
      logo={<AppLogo className="w-[85px] md:w-[95px]" />}
      description="Tajeer Plus - Empowering car rental businesses in Saudi Arabia with cutting-edge technology and seamless operations management."
      copyright={
        <span>
          © {new Date().getFullYear()} Tajeer Plus. All rights reserved.
        </span>
      }
      sections={[
        {
          heading: 'Get Started',
          links: [
            {
              href: '/auth/sign-in',
              label: 'Sign In',
            },
            {
              href: '/auth/sign-up',
              label: 'Get Started',
            },
          ],
        },
        {
          heading: 'Legal',
          links: [
            {
              href: '/terms-of-service',
              label: 'Terms of Service',
            },
            {
              href: '/privacy-policy',
              label: 'Privacy Policy',
            },
          ],
        },
      ]}
    />
  );
}
