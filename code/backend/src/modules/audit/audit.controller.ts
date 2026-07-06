import { Response } from 'express';
import { AuditService } from './audit.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const auditService = new AuditService();

export class AuditController {
  async getAuditLogs(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await auditService.getAuditLogs({ page, limit });
    res.status(200).json({ success: true, ...result });
  }
}
