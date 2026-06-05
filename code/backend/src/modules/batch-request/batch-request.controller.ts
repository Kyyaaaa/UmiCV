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

  async cancel(req: AuthRequest, res: Response) {
    const hrUserId = req.user!.userId;
    const batchId = req.params.id;

    const result = await batchRequestService.cancelBatchRequest(batchId, hrUserId);
    res.status(200).json({ success: true, ...result });
  }
}
