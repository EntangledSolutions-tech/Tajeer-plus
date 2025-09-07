import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 150,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/images/Logo/Tajeer Plus Logo [2x].png"
        alt="Tajeer Plus"
        width={width}
        height={60}
        className="h-12 w-auto"
        priority
      />
    </div>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
