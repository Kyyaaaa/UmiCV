import { Request, Response } from 'express';
import { SearchService } from './search.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const searchService = new SearchService();

export class SearchController {
  async search(req: AuthRequest, res: Response) {
    // Controller receives validated query params
    const result = await searchService.searchCVs(req.query as any);
    res.status(200).json({ success: true, ...result });
  }

  async diff(req: AuthRequest, res: Response) {
    const cvId = req.params.id;
    const result = await searchService.diffCV(cvId);
    res.status(200).json({ success: true, data: result });
  }
}
