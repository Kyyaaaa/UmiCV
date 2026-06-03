import prisma from '../../config/db';
import { UpsertDraftInput } from './cv.dto';
import { NotFoundError, BadRequestError } from '../../errors/AppError';
import { CVStatus } from '@prisma/client';

export class CVService {
  async getDraft(userId: string, languageCode: string) {
    const cv = await prisma.cVProfile.findUnique({
      where: {
        userId_languageCode: {
          userId,
          languageCode,
        },
      },
    });

    if (!cv) {
      throw new NotFoundError('CV Profile not found');
    }

    return cv;
  }

  async upsertDraft(userId: string, data: UpsertDraftInput) {
    // If it exists, we update. If not, we create with Draft status.
    // However, if it exists and is PendingApproval, we might not allow editing,
    // according to typical workflow rules. Let's enforce that.
    
    const existing = await prisma.cVProfile.findUnique({
      where: {
        userId_languageCode: {
          userId,
          languageCode: data.languageCode,
        },
      },
    });

    if (existing && existing.status === CVStatus.PendingApproval) {
      throw new BadRequestError('Cannot edit CV while it is pending approval');
    }

    const cv = await prisma.cVProfile.upsert({
      where: {
        userId_languageCode: {
          userId,
          languageCode: data.languageCode,
        },
      },
      update: {
        sectionsData: data.sectionsData,
        // If it was Outdated or Cancelled, it goes back to Draft? 
        // According to docs, Employee works on Draft. Let's just set it to Draft.
        status: CVStatus.Draft,
      },
      create: {
        userId,
        languageCode: data.languageCode,
        sectionsData: data.sectionsData,
        status: CVStatus.Draft,
      },
    });

    return cv;
  }
}
