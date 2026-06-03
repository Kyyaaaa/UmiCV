import { z } from 'zod';

export const upsertDraftSchema = z.object({
  body: z.object({
    languageCode: z.enum(['vi', 'en', 'jp']),
    sectionsData: z.record(z.any()),
  }),
});

export type UpsertDraftInput = z.infer<typeof upsertDraftSchema>['body'];
