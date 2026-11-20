/* eslint-disable @next/next/no-img-element */
import { getInitials } from '@/shared/utils';
import { cn } from './utils';

export function Avatar({
  name,
  src,
  size = 72,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn('shrink-0 rounded-pill bg-muted object-cover', className)}
        style={style}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-pill bg-muted font-semibold text-subtle-foreground', className)}
      style={{ ...style, fontSize: size * 0.42 }}
    >
      {getInitials(name)}
    </span>
  );
}
