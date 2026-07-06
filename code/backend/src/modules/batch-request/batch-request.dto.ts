import { z } from 'zod';

export const createBatchRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Tiêu đề không được bỏ trống'),
    description: z.string().optional(),
    deadline: z.string().datetime().refine(val => new Date(val) > new Date(), { message: 'Hạn chót phải lớn hơn thời gian hiện tại' }),
    targetUserIds: z.array(z.string().uuid()).max(500, 'Tối đa 500 nhân viên cho mỗi chiến dịch'),
  }),
});

export const updateBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Định dạng ID chiến dịch không hợp lệ'),
  }),
  body: z.object({
    title: z.string().min(1, 'Tiêu đề không được bỏ trống').optional(),
    description: z.string().optional(),
    deadline: z.string().datetime().refine(val => new Date(val) > new Date(), { message: 'Hạn chót phải lớn hơn thời gian hiện tại' }).optional(),
    targetUserIds: z.array(z.string().uuid()).max(500, 'Tối đa 500 nhân viên cho mỗi chiến dịch').optional(),
  }),
});

export const deleteBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Định dạng ID chiến dịch không hợp lệ'),
  }),
});

export const cancelBatchRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Định dạng ID chiến dịch không hợp lệ'),
  }),
});

export const remindTargetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Định dạng ID chiến dịch không hợp lệ'),
    userId: z.string().uuid('Định dạng ID người dùng không hợp lệ'),
  }),
});

export const getBatchRequestsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    keyword: z.string().optional(),
    status: z.enum(['Active', 'Cancelled', 'Completed']).optional(),
  }),
});

export const getBatchRequestTargetsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Định dạng ID chiến dịch không hợp lệ'),
  }),
  query: z.object({
    status: z.enum(['Outdated', 'Updated']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),
});

export type CreateBatchRequestInput = z.infer<typeof createBatchRequestSchema>['body'];
export type UpdateBatchRequestInput = z.infer<typeof updateBatchRequestSchema>['body'];
