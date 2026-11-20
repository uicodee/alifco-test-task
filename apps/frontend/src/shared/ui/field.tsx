'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { EyeClosedIcon, EyeIcon } from './icon';
import { cn } from './utils';

export type InputFieldProps = Omit<ComponentProps<'input'>, 'size'> & {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  suffix?: ReactNode;
};

export function InputField({ label, description, error, suffix, className, id: idProp, ...props }: InputFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const messageId = `${id}-message`;
  return (
    <div data-slot="field" data-invalid={!!error || undefined} className="flex flex-col gap-1.5">
      <div
        className={cn(
          'flex items-center gap-3 rounded-20 bg-muted px-4 py-3 transition-shadow focus-within:ring-[1.5px] focus-within:ring-brand',
          error && 'ring-[1.5px] ring-danger focus-within:ring-danger',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <label htmlFor={id} className="text-micro text-muted-foreground">
            {label}
          </label>
          <input
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={error || description ? messageId : undefined}
            className={cn(
              'w-full min-w-0 bg-transparent p-0 text-[17px] leading-6 font-semibold tracking-md text-foreground outline-none focus-visible:outline-none',
              className,
            )}
            {...props}
          />
        </div>
        {suffix}
      </div>
      <FieldMessage id={messageId} error={error} description={description} />
    </div>
  );
}

function FieldMessage({ id, error, description }: { id?: string; error?: ReactNode; description?: ReactNode }) {
  if (error) {
    return (
      <span id={id} className="px-1 text-caption text-danger-fg">
        {error}
      </span>
    );
  }
  if (description) {
    return (
      <span id={id} className="px-1 text-caption text-muted-foreground">
        {description}
      </span>
    );
  }
  return null;
}

export function PasswordField(props: Omit<InputFieldProps, 'type' | 'suffix'>) {
  const [visible, setVisible] = useState(false);
  return (
    <InputField
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          className="-mr-2 flex size-11 items-center justify-center rounded-pill text-muted-foreground pressable hover:text-foreground"
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeClosedIcon size={22} /> : <EyeIcon size={22} />}
        </button>
      }
    />
  );
}
