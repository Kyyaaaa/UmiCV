import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');

export const validatePassword = (password: string): string | null => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  return null;
};
