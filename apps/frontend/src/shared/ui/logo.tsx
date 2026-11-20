import Link from 'next/link';
import { ROUTES } from '@/shared/config';
import { cn } from './utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn('inline-flex min-h-11 items-center self-start rounded-12 text-[21px] font-bold tracking-2xl', className)}
    >
      Alifco Auth<span className="text-brand">.</span>
    </Link>
  );
}
