import { z } from 'zod';

export const createBatchRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    deadline: z.string().datetime().refine(val => new Date(val) > new Date(), { message: 'Hạn chót phải lớn hơn thời gian hiện tại' }),
    targetUserIds: z.array(z.string().uuid()).max(500, 'Maximum 500 users allowed per batch request'),
  }),
});

export const cancelBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
  }),
});

export const remindTargetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

export const getBatchRequestsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    keyword: z.string().optional(),
    status: z.enum(['Active', 'Cancelled']).optional(),
  }),
});

export const getBatchRequestTargetsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid batch ID format'),
  }),
  query: z.object({
    status: z.enum(['Outdated', 'Updated']).optional(),
  }),
});

export type CreateBatchRequestInput = z.infer<typeof createBatchRequestSchema>['body'];
