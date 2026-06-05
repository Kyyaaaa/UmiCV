import { z } from 'zod';
import { CVStatus } from '@prisma/client';

export const createCVSchema = z.object({
  body: z.object({
    languageCode: z.enum(['vi', 'en', 'jp']),
  }),
});

export const updateDraftSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    sectionsData: z.record(z.any()),
  }),
});

export const getCVByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const cvVersionParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    versionId: z.string().uuid(),
  }),
});

export const publishCVSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const copyLocalizationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    targetLanguageCode: z.enum(['vi', 'en', 'jp']),
  }),
});

export const diffChangeSchema = z.object({
  path: z.string(),
  type: z.enum(['added', 'removed', 'modified']),
  oldValue: z.unknown(),
  newValue: z.unknown(),
});

export type CreateCVInput = z.infer<typeof createCVSchema>['body'];
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>['body'];
export type CopyLocalizationInput = z.infer<typeof copyLocalizationSchema>['body'];
export type DiffChangeDto = z.infer<typeof diffChangeSchema>;

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
