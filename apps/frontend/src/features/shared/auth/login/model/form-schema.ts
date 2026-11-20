import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Введите email').email('Введите email в формате name@example.com').max(254, 'Слишком длинный email'),
  password: z.string().min(1, 'Введите пароль').max(128, 'Не больше 128 символов'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
