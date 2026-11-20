'use client';

import { Dialog } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from './utils';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

type SheetContentProps = ComponentProps<typeof Dialog.Content> & {
  title: ReactNode;
  description?: ReactNode;
};

export const SheetContent = ({ title, description, className, children, ...props }: SheetContentProps) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-overlay data-[state=closed]:animate-fade-out" />
    <Dialog.Content
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] animate-sheet-in data-[state=closed]:animate-sheet-out lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:w-[480px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:animate-dialog-in lg:rounded-32 lg:pb-6 lg:data-[state=closed]:animate-dialog-out flex-col gap-4.5 overflow-y-auto rounded-t-32 bg-background px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom,0px))] text-foreground outline-none',
        className,
      )}
      {...props}
    >
      <span aria-hidden className="mx-auto h-1.25 w-10 shrink-0 rounded-pill bg-control" />
      <div className="flex flex-col gap-1.5">
        <Dialog.Title className="m-0 text-section">{title}</Dialog.Title>
        {description ? (
          <Dialog.Description className="m-0 text-body text-muted-foreground">{description}</Dialog.Description>
        ) : (
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
        )}
      </div>
      {children}
    </Dialog.Content>
  </Dialog.Portal>
);
