import { z } from 'zod';
import { newPasswordSchema } from '@/shared/lib/password-schema';

export const createSetPasswordSchema = (hasPassword: boolean) =>
  z.object({
    currentPassword: hasPassword
      ? z.string().min(1, 'Введите текущий пароль').max(128, 'Не больше 128 символов')
      : z.string().optional(),
    newPassword: newPasswordSchema,
  });

export type SetPasswordFormValues = z.infer<ReturnType<typeof createSetPasswordSchema>>;
