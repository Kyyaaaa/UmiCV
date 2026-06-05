import { Response } from 'express';
import { CVService } from './cv.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const cvService = new CVService();

export class CVController {
  async getMyCVs(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const list = await cvService.getMyCVs(userId);

    res.status(200).json({
      success: true,
      data: list,
    });
  }

  async createCV(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const data = req.body;
    const cv = await cvService.createCV(userId, data);

    res.status(201).json({
      success: true,
      data: cv,
    });
  }

  async getCVById(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const cvId = req.params.id;
    const cv = await cvService.getCVById(cvId, userId);

    res.status(200).json({
      success: true,
      data: cv,
    });
  }

  async updateDraftById(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const cvId = req.params.id;
    const data = req.body;

    const cv = await cvService.updateDraftById(cvId, userId, data);

    res.status(200).json({
      success: true,
      data: cv,
    });
  }

  async getCVVersions(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const cvId = req.params.id;
    const versions = await cvService.getCVVersions(cvId, userId);

    res.status(200).json({
      success: true,
      data: versions,
    });
  }

  async getCVVersionById(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const { id, versionId } = req.params;
    const version = await cvService.getCVVersionById(id, versionId, userId);

    res.status(200).json({
      success: true,
      data: version,
    });
  }

  async restoreCVVersion(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const { id, versionId } = req.params;
    const cv = await cvService.restoreCVVersion(id, versionId, userId);

    res.status(200).json({
      success: true,
      data: cv,
    });
  }

  async publish(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const cvId = req.params.id;
    
    const cv = await cvService.publishCV(cvId, userId);

    res.status(200).json({
      success: true,
      message: 'CV submitted for approval',
      data: cv,
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
