import { z } from 'zod';

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.string().optional(),
    link: z.string().optional(),
  }),
});

export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>['body'];
