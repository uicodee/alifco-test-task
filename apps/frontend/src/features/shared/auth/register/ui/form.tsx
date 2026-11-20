'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { getAuthPagePath } from '@/features/shared/auth/model/auth-redirect';
import { useAuthSuccess } from '@/features/shared/auth/model/use-auth-success';
import {
  PASSWORD_HINT,
  registerFormSchema,
  type RegisterFormValues,
} from '@/features/shared/auth/register/model/form-schema';
import { getAuth } from '@/shared/api/generated/auth/auth';
import { getApiErrorMessage, parseApiError } from '@/shared/api/http/error';
import { Alert, Button, InputField, PasswordField, Spinner } from '@/shared/ui';

const FIELDS = ['name', 'email', 'password'] as const;

export function RegisterForm({ after }: { after: string }) {
  const onSuccess = useAuthSuccess(after);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const { errors } = form.formState;

  const register = useMutation({
    mutationFn: (values: RegisterFormValues) => getAuth().authRegister(values),
    onSuccess,
    onError: (error) => {
      const parsed = parseApiError(error);
      if (parsed.code === 'AUTH_EMAIL_TAKEN') {
        form.setError('email', { type: 'taken', message: 'На этот email уже есть аккаунт.' });
        return;
      }
      for (const field of Object.keys(parsed.fieldErrors)) {
        if ((FIELDS as readonly string[]).includes(field)) form.setError(field as (typeof FIELDS)[number], { message: 'Проверьте это поле' });
      }
    },
  });

  const emailTaken = errors.email?.type === 'taken';
  const showAlert = register.isError && !emailTaken;

  return (
    <form onSubmit={form.handleSubmit((values) => register.mutate(values))} className="flex flex-col gap-4" noValidate>
      <InputField
        label="Имя"
        autoComplete="name"
        placeholder="Как к вам обращаться?"
        maxLength={120}
        error={errors.name?.message}
        {...form.register('name')}
      />
      <InputField
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="name@example.com"
        error={
          emailTaken ? (
            <>
              {errors.email?.message}{' '}
              <Link href={getAuthPagePath('login', after)} className="font-semibold underline underline-offset-2">
                Войти
              </Link>
            </>
          ) : (
            errors.email?.message
          )
        }
        {...form.register('email')}
      />
      <PasswordField
        label="Пароль"
        autoComplete="new-password"
        maxLength={128}
        description={PASSWORD_HINT}
        error={errors.password?.message}
        {...form.register('password')}
      />
      {showAlert && <Alert>{getApiErrorMessage(register.error)}</Alert>}
      <Button type="submit" block disabled={register.isPending}>
        {register.isPending && <Spinner />}
        {register.isPending ? 'Создаём аккаунт…' : 'Создать аккаунт'}
      </Button>
    </form>
  );
}
