import { Response } from 'express';
import { BatchRequestService } from './batch-request.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const batchRequestService = new BatchRequestService();

export class BatchRequestController {
  async create(req: AuthRequest, res: Response) {
    const hrUserId = req.user!.userId;
    const data = req.body;

    const result = await batchRequestService.createBatchRequest(hrUserId, data);
    res.status(201).json({ success: true, data: result });
  }

  async getAll(req: AuthRequest, res: Response) {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const keyword = req.query.keyword as string;
    const status = req.query.status as string;

    const result = await batchRequestService.getBatchRequests({ page, limit, keyword, status });
    res.status(200).json({ success: true, ...result });
  }

  async getTargets(req: AuthRequest, res: Response) {
    const batchId = req.params.id;
    const status = req.query.status as string;

    const result = await batchRequestService.getBatchRequestTargets(batchId, { status });
    res.status(200).json({ success: true, data: result });
  }

  async cancel(req: AuthRequest, res: Response) {
    const hrUserId = req.user!.userId;
    const batchId = req.params.id;

    const result = await batchRequestService.cancelBatchRequest(batchId, hrUserId);
    res.status(200).json({ success: true, ...result });
  }
}
