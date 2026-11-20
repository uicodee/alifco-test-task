'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useAuthSuccess } from '@/features/shared/auth/model/use-auth-success';
import { loginFormSchema, type LoginFormValues } from '@/features/shared/auth/login/model/form-schema';
import { getAuth } from '@/shared/api/generated/auth/auth';
import { getApiErrorMessage, parseApiError } from '@/shared/api/http/error';
import { Alert, Button, InputField, PasswordField, Spinner } from '@/shared/ui';

const SERVER_FIELD_ERROR = 'Проверьте это поле';

export function LoginForm({ after }: { after: string }) {
  const onSuccess = useAuthSuccess(after);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });
  const { errors } = form.formState;

  const login = useMutation({
    mutationFn: (values: LoginFormValues) => getAuth().authLogin(values),
    onSuccess,
    onError: (error) => {
      for (const field of Object.keys(parseApiError(error).fieldErrors)) {
        if (field === 'email' || field === 'password') form.setError(field, { message: SERVER_FIELD_ERROR });
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => login.mutate(values))} className="flex flex-col gap-4" noValidate>
      <InputField
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="name@example.com"
        error={errors.email?.message}
        {...form.register('email')}
      />
      <PasswordField
        label="Пароль"
        autoComplete="current-password"
        error={errors.password?.message}
        {...form.register('password')}
      />
      {login.isError && <Alert>{getApiErrorMessage(login.error)}</Alert>}
      <Button type="submit" block disabled={login.isPending}>
        {login.isPending && <Spinner />}
        {login.isPending ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  );
}
