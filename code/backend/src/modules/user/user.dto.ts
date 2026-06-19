import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage = 'Mật khẩu phải dài tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt';

export const queryUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
    keyword: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().max(255),
    fullName: z.string().min(1).max(255),
    password: z.string().regex(passwordRegex, passwordMessage),
    role: z.nativeEnum(UserRole),
    departmentId: z.string().uuid(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    fullName: z.string().min(1).max(255).optional(),
    role: z.nativeEnum(UserRole).optional(),
    departmentId: z.string().uuid().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }).strict(),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    newPassword: z.string().regex(passwordRegex, passwordMessage),
  }),
});

export const changeRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    role: z.nativeEnum(UserRole),
  }),
});

// Used for operations that only need ID in param
export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
  }).strict(),
});

export const changeMyPasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().regex(passwordRegex, passwordMessage),
  }),
});
