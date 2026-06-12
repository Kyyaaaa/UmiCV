import { z } from 'zod';
import { CVStatus } from '@prisma/client';

export const createCVSchema = z.object({
  body: z.object({
    languageCode: z.enum(['vi', 'en', 'jp']),
  }),
});

const personalInfoSchema = z.object({
  name: z.string().nullish(),
  about: z.string().nullish(),
  role: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  location: z.string().nullish(),
  website: z.string().nullish(),
  github: z.string().nullish(),
  linkedin: z.string().nullish(),
}).strict();

const experienceSchema = z.object({
  company: z.string().nullish(),
  title: z.string().nullish(),
  date: z.string().nullish(),
  desc: z.string().nullish(),
}).strict();

const educationSchema = z.object({
  institution: z.string().nullish(),
  date: z.string().nullish(),
  qualification: z.string().nullish(),
}).strict();

const projectSchema = z.object({
  name: z.string().nullish(),
  link: z.string().nullish(),
  desc: z.string().nullish(),
}).strict();

const skillSchema = z.object({
  name: z.string().nullish(),
}).strict();

export const updateDraftSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    sectionsData: z.object({
      personalInfo: personalInfoSchema.optional(),
      skills: z.array(skillSchema).optional(),
      experience: z.array(experienceSchema).optional(),
      education: z.array(educationSchema).optional(),
      projects: z.array(projectSchema).optional(),
    }).strict(),
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
