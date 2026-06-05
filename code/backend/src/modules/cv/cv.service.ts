import prisma from '../../config/db';
import { Prisma, CVStatus } from '@prisma/client';
import { UpsertDraftInput, SearchInput } from './cv.dto';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';
import { MESSAGES } from '../../constants/messages';

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
      throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
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
      throw new BadRequestError(MESSAGES.CV.CANNOT_EDIT_PENDING);
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

  async searchCVs(query: SearchInput) {
    const { keyword, departmentId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CVProfileWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.user = { departmentId };
    }

    if (keyword) {
      // Fix Regression: Secure JSON parameterization to prevent parsing errors
      const searchJson = JSON.stringify({ skills: [keyword] });
      const matchingIds = await prisma.$queryRaw<{id: string}[]>`
        SELECT id FROM cv_profiles 
        WHERE sections_data @> CAST(${searchJson} AS jsonb)
      `;
      
      where.OR = [
        { user: { username: { contains: keyword, mode: 'insensitive' } } },
        { id: { in: matchingIds.map(r => r.id) } }
      ];
    }

    const [total, data] = await Promise.all([
      prisma.cVProfile.count({ where }),
      prisma.cVProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, department: true } },
        },
      }),
    ]);

    return { total, page, data };
  }

  async diffCV(cvId: string, requestUserId: string, requestUserRole: string) {
    const cv = await prisma.cVProfile.findUnique({
      where: { id: cvId },
      include: {
        histories: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);

    // Fix C2: IDOR protection
    let hasAccess = false;
    if (cv.userId === requestUserId) {
      hasAccess = true;
    } else if (['HR', 'Admin'].includes(requestUserRole)) {
      hasAccess = true;
    } else if (requestUserRole === 'TechLead') {
      const isLead = await prisma.projectMember.findFirst({
        where: {
          userId: cv.userId,
          project: { techLeadId: requestUserId }
        }
      });
      if (isLead) hasAccess = true;
    }

    if (!hasAccess) {
      throw new ForbiddenError(MESSAGES.CV.FORBIDDEN_DIFF);
    }

    const draft = cv.sectionsData;
    const original = cv.histories.length > 0 ? cv.histories[0].snapshotData : null;

    // Fix M3: Removing diff field computation per API contract update.
    return { original, draft };
  }
}
