'use client';

import { useState, type ReactNode } from 'react';
import { OAUTH_PROVIDERS } from '@/features/shared/auth';
import { SetPasswordForm } from '@/features/shared/set-password';
import type { UserDto } from '@/shared/api/model';
import { Alert, Badge, Button, Sheet, SheetContent } from '@/shared/ui';

export function SignInMethods({ user }: { user: UserDto }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const emailDetail = user.hasPassword
    ? (user.email ?? '')
    : user.email
      ? `${user.email} · пароль не задан`
      : 'Email не указан';
  const canSetPassword = !!user.email;
  const linkedNames = OAUTH_PROVIDERS.filter((p) => user.providers.includes(p.id)).map((p) => p.label);
  const sheetDescription = user.hasPassword
    ? 'Введите текущий пароль и новый. На других устройствах нужно будет войти заново.'
    : `Тогда в аккаунт ${user.email} можно будет входить по паролю, а не только через ${linkedNames.join(' или ') || 'соцсеть'}.`;

  return (
    <section className="flex flex-col rounded-32 bg-background p-6 sm:p-8" aria-labelledby="methods-title">
      <h2 id="methods-title" className="m-0 text-section">
        Способы входа
      </h2>
      <p className="m-0 mt-1 text-body text-muted-foreground">Как можно войти в этот аккаунт.</p>
      <ul className="m-0 mt-5 flex list-none flex-col p-0">
        <MethodRow
          icon={<span className="text-[15px] font-bold">@</span>}
          title="Email и пароль"
          detail={emailDetail}
          note={user.hasPassword && !user.emailVerified ? 'Email не подтверждён' : undefined}
          action={
            canSetPassword ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditing(true);
                  setSaved(false);
                }}
              >
                {user.hasPassword ? 'Сменить пароль' : 'Задать пароль'}
              </Button>
            ) : undefined
          }
        >
          {saved && (
            <Alert variant="success">
              Пароль сохранён. Теперь можно входить по email и паролю, а на других устройствах нужно войти заново.
            </Alert>
          )}
        </MethodRow>
        {OAUTH_PROVIDERS.map(({ id, label, Logo }) => {
          const linked = user.providers.includes(id);
          return (
            <MethodRow
              key={id}
              icon={<Logo size={24} />}
              title={label}
              detail={linked ? 'Привязан' : 'Не привязан'}
              aside={linked ? <Badge variant="success">Активен</Badge> : undefined}
            />
          );
        })}
      </ul>

      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent title={user.hasPassword ? 'Сменить пароль' : 'Задать пароль'} description={sheetDescription}>
          <SetPasswordForm
            user={user}
            onCancel={() => setEditing(false)}
            onDone={() => {
              setEditing(false);
              setSaved(true);
            }}
          />
        </SheetContent>
      </Sheet>
    </section>
  );
}

function MethodRow({
  icon,
  title,
  detail,
  note,
  aside,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  note?: string;
  aside?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-4 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-muted" aria-hidden>
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[15px] font-semibold">{title}</span>
          <span className="truncate text-caption text-muted-foreground">{detail}</span>
          {note && <span className="text-caption font-medium text-subtle-foreground">{note}</span>}
        </div>
        {aside}
        {action && <div className="basis-full pl-15 sm:basis-auto sm:pl-0">{action}</div>}
      </div>
      {children}
    </li>
  );
}
