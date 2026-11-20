import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from './utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-semibold tracking-sm whitespace-nowrap pressable disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-solid text-brand-foreground hover:bg-brand-solid-pressed active:bg-brand-solid-pressed',
        secondary: 'bg-muted text-foreground hover:bg-control/60',
        outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
      },
      size: {
        lg: 'h-14 px-6.5 text-base',
        md: 'h-12 px-5 text-[15px]',
        sm: 'h-11 px-4.5 text-sm tracking-xs',
        icon: 'size-11 p-0',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'lg' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, type, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      type={type ?? 'button'}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}
