import { z } from 'zod';
import { newPasswordSchema } from '@/shared/lib/password-schema';

export { PASSWORD_HINT } from '@/shared/lib/password-schema';

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите имя').max(120, 'Не больше 120 символов'),
  email: z.string().trim().min(1, 'Введите email').email('Введите email в формате name@example.com').max(254, 'Слишком длинный email'),
  password: newPasswordSchema,
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
