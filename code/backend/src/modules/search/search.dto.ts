import { z } from 'zod';
import { CVStatus } from '@prisma/client';

export const searchSchema = z.object({
  query: z.object({
    keyword: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    status: z.nativeEnum(CVStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),
});

export type SearchInput = z.infer<typeof searchSchema>['query'];
