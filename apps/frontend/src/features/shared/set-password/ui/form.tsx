'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  createSetPasswordSchema,
  type SetPasswordFormValues,
} from '@/features/shared/set-password/model/form-schema';
import { getAuth } from '@/shared/api/generated/auth/auth';
import { getApiErrorMessage, parseApiError } from '@/shared/api/http/error';
import type { UserDto } from '@/shared/api/model';
import { PASSWORD_HINT } from '@/shared/lib/password-schema';
import { useAuth } from '@/shared/providers';
import { Alert, Button, PasswordField, Spinner } from '@/shared/ui';

export function SetPasswordForm({ user, onDone, onCancel }: { user: UserDto; onDone: () => void; onCancel: () => void }) {
  const { setUser } = useAuth();
  const hasPassword = user.hasPassword;
  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(createSetPasswordSchema(hasPassword)),
    defaultValues: { currentPassword: '', newPassword: '' },
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (values: SetPasswordFormValues) =>
      getAuth().authSetPassword({
        newPassword: values.newPassword,
        ...(hasPassword ? { currentPassword: values.currentPassword } : {}),
      }),
    onSuccess: (updated) => {
      setUser(updated);
      onDone();
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      if (parsed.code === 'AUTH_CURRENT_PASSWORD_INVALID') {
        form.setError('currentPassword', { type: 'server', message: 'Неверный текущий пароль' });
      }
    },
  });

  const wrongCurrent = errors.currentPassword?.type === 'server';
  return (
    <form
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
      className="flex flex-col gap-4"
      noValidate
    >
      <input type="email" name="username" autoComplete="username" value={user.email ?? ''} readOnly hidden />
      {hasPassword && (
        <PasswordField
          label="Текущий пароль"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...form.register('currentPassword')}
        />
      )}
      <PasswordField
        label={hasPassword ? 'Новый пароль' : 'Пароль'}
        autoComplete="new-password"
        maxLength={128}
        description={PASSWORD_HINT}
        error={errors.newPassword?.message}
        {...form.register('newPassword')}
      />
      {save.isError && !wrongCurrent && <Alert>{getApiErrorMessage(save.error)}</Alert>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="md" disabled={save.isPending} className="sm:flex-1">
          {save.isPending && <Spinner size={18} />}
          {hasPassword ? 'Сменить пароль' : 'Сохранить пароль'}
        </Button>
        <Button variant="secondary" size="md" onClick={onCancel} disabled={save.isPending}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
