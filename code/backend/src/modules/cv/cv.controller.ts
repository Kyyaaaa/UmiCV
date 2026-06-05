import { Response } from 'express';
import { CVService } from './cv.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const cvService = new CVService();

export class CVController {
  async getDraft(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    // Assume validation middleware parsed the query into req.query with default 'vi'
    const languageCode = (req.query.languageCode as string) || 'vi'; 
    const draft = await cvService.getDraft(userId, languageCode);

    res.status(200).json({
      success: true,
      data: draft,
    });
  }

  async upsertDraft(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const data = req.body;

    const draft = await cvService.upsertDraft(userId, data);

    res.status(200).json({
      success: true,
      data: draft,
    });
  }

  async search(req: AuthRequest, res: Response) {
    const result = await cvService.searchCVs(req.query as any);
    res.status(200).json({ success: true, ...result });
  }

  async diff(req: AuthRequest, res: Response) {
    const cvId = req.params.id;
    const requestUserId = req.user!.userId;
    const requestUserRole = req.user!.role;
    const result = await cvService.diffCV(cvId, requestUserId, requestUserRole);
    res.status(200).json({ success: true, data: result });
  }
}
