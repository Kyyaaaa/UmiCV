import { Response } from 'express';
import { WorkflowService } from './workflow.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const workflowService = new WorkflowService();

export class WorkflowController {
  async submitDraft(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const data = req.body;
    const result = await workflowService.submitDraft(userId, data);
    res.status(200).json({ success: true, ...result });
  }

  async approveCV(req: AuthRequest, res: Response) {
    const approverId = req.user!.userId;
    const cvId = req.params.id;
    const data = req.body;

    const result = await workflowService.approveCV(cvId, approverId, data);
    res.status(200).json({ success: true, ...result });
  }

  async rejectCV(req: AuthRequest, res: Response) {
    const approverId = req.user!.userId;
    const cvId = req.params.id;
    const data = req.body;
    // Derive level from user role for simple rejection logic
    const level = req.user!.role === 'HR' ? 2 : 1; 

    const result = await workflowService.rejectCV(cvId, approverId, data, level);
    res.status(200).json({ success: true, ...result });
  }

  async getApprovalLogs(req: AuthRequest, res: Response) {
    const cvId = req.params.id;
    const result = await workflowService.getApprovalLogs(cvId);
    res.status(200).json({ success: true, data: result });
  }
}
