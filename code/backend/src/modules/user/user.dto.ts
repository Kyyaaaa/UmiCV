import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const queryUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
    keyword: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().max(255),
    fullName: z.string().min(1).max(255),
    password: z.string().min(6),
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
    newPassword: z.string().min(6),
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
