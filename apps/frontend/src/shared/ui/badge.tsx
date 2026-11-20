import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './utils';

const badgeVariants = cva('inline-block shrink-0 rounded-pill px-3 py-1 text-micro', {
  variants: {
    variant: {
      success: 'bg-success-bg font-semibold text-success-fg',
      neutral: 'bg-muted font-medium text-subtle-foreground',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
