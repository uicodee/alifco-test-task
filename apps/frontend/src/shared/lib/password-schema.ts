import { z } from 'zod';

export const PASSWORD_HINT = 'Не меньше 8 символов, хотя бы одна буква и одна цифра';

export const newPasswordSchema = z
  .string()
  .min(8, 'Не меньше 8 символов')
  .max(128, 'Не больше 128 символов')
  .regex(/\p{L}/u, 'Добавьте хотя бы одну букву')
  .regex(/\d/, 'Добавьте хотя бы одну цифру');
