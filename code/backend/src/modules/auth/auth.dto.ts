import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Tên đăng nhập không được bỏ trống'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
  }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage = 'Mật khẩu phải dài tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt';

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Mã xác nhận không được bỏ trống'),
    newPassword: z.string().regex(passwordRegex, passwordMessage),
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
