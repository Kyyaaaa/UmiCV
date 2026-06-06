import { z } from 'zod';

export const approveSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    level: z.number().int().min(1).max(2),
  }),
});

export const rejectSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1),
    sectionId: z.string().optional(),
  }),
});

export const submitDraftSchema = z.object({
  body: z.object({
    languageCode: z.enum(['vi', 'en', 'jp']).default('vi'),
  }),
});

export type ApproveInput = z.infer<typeof approveSchema>['body'];
export type RejectInput = z.infer<typeof rejectSchema>['body'];
export type SubmitDraftInput = z.infer<typeof submitDraftSchema>['body'];
