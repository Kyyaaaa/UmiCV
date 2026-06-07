import prisma from '../../config/db';
import { Prisma, CVStatus } from '@prisma/client';
import { SearchInput, CreateCVInput, UpdateDraftInput } from './cv.dto';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';
import { MESSAGES } from '../../constants/messages';
import { generateDiff } from './cv.diff';

export class CVService {
  async getMyCVs(userId: string) {
    return prisma.cVProfile.findMany({
      where: { userId },
      select: {
        id: true,
        languageCode: true,
        status: true,
        versionNumber: true,
        updatedAt: true,
      },
    });
  }

  async createCV(userId: string, data: CreateCVInput) {
    const existing = await prisma.cVProfile.findUnique({
      where: {
        userId_languageCode: { userId, languageCode: data.languageCode },
      },
    });

    if (existing) {
      throw new BadRequestError('CV with this language already exists');
    }

    return prisma.cVProfile.create({
      data: {
        userId,
        languageCode: data.languageCode,
        status: CVStatus.Draft,
        sectionsData: {},
      },
    });
  }

  async getCVById(id: string, userId: string, role?: string) {
    const cv = await prisma.cVProfile.findUnique({ where: { id } });

    if (!cv) {
      throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    }

    // IDOR protection
    if ((!role || role === 'Employee') && cv.userId !== userId) {
      throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
    }

    if (role === 'TechLead' && cv.userId !== userId) {
      const projects = await prisma.project.findMany({
        where: { techLeadId: userId },
        include: { members: true },
      });
      const memberIds = projects.flatMap((p) => p.members.map((m) => m.userId));
      if (!memberIds.includes(cv.userId)) {
        throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
      }
    }

    return cv;
  }

  async updateDraftById(id: string, userId: string, role: string, data: UpdateDraftInput) {
    const existing = await prisma.cVProfile.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    }

    if (existing.userId !== userId && !['HR', 'Admin'].includes(role)) {
      throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
    }

    if (existing.status === CVStatus.PendingApproval) {
      throw new BadRequestError(MESSAGES.CV.CANNOT_EDIT_PENDING);
    }

    return prisma.cVProfile.update({
      where: { id },
      data: {
        sectionsData: data.sectionsData,
        status: CVStatus.Draft,
      },
    });
  }

  async getCVVersions(cvId: string, userId: string, role: string) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (cv.userId !== userId) {
      if (!['HR', 'Admin', 'TechLead'].includes(role)) throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
      if (role === 'TechLead') {
        const isLead = await prisma.projectMember.findFirst({
          where: { userId: cv.userId, project: { techLeadId: userId } }
        });
        if (!isLead) throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
      }
    }

    return prisma.cVVersionHistory.findMany({
      where: { cvProfileId: cvId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        createdAt: true,
      },
    });
  }

  async getCVVersionById(cvId: string, versionId: string, userId: string, role: string) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (cv.userId !== userId) {
      if (!['HR', 'Admin', 'TechLead'].includes(role)) throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
      if (role === 'TechLead') {
        const isLead = await prisma.projectMember.findFirst({
          where: { userId: cv.userId, project: { techLeadId: userId } }
        });
        if (!isLead) throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
      }
    }

    const version = await prisma.cVVersionHistory.findUnique({
      where: { id: versionId },
    });

    if (!version || version.cvProfileId !== cvId) {
      throw new NotFoundError('Version not found');
    }

    return version;
  }

  async restoreCVVersion(cvId: string, versionId: string, userId: string, role: string) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (cv.userId !== userId && !['HR', 'Admin'].includes(role)) {
      throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
    }

    if (cv.status === CVStatus.PendingApproval) {
      throw new BadRequestError(MESSAGES.CV.CANNOT_EDIT_PENDING);
    }

    const version = await prisma.cVVersionHistory.findUnique({
      where: { id: versionId },
    });

    if (!version || version.cvProfileId !== cvId) {
      throw new NotFoundError('Version not found');
    }

    return prisma.cVProfile.update({
      where: { id: cvId },
      data: {
        sectionsData: version.snapshotData as any,
        status: CVStatus.Draft,
      },
    });
  }

  async publishCV(cvId: string, userId: string, role: string) {
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
    if (cv.userId !== userId && !['HR', 'Admin'].includes(role)) {
      throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
    }

    if (cv.status === CVStatus.PendingApproval) {
      throw new BadRequestError(MESSAGES.CV.CANNOT_EDIT_PENDING);
    }

    // Bug-04 Fix: Check for empty changes
    const draftJson = JSON.stringify(cv.sectionsData);
    const originalJson = cv.histories.length > 0 ? JSON.stringify(cv.histories[0].snapshotData) : '{}';

    if (draftJson === originalJson) {
      throw new BadRequestError('NO_CHANGES_TO_PUBLISH');
    }

    return prisma.cVProfile.update({
      where: { id: cvId },
      data: {
        status: CVStatus.PendingApproval,
        submittedAt: new Date(),
      },
    });
  }

  async searchCVs(query: SearchInput, requestUserId: string, requestUserRole: string) {
    const { keyword, departmentId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CVProfileWhereInput = {};

    // RBAC: Data Scope Isolation
    if (requestUserRole === 'Employee') {
      where.userId = requestUserId;
    } else if (requestUserRole === 'TechLead') {
      const projects = await prisma.project.findMany({
        where: { techLeadId: requestUserId },
        include: { members: true },
      });
      const memberIds = projects.flatMap((p) => p.members.map((m) => m.userId));
      where.userId = { in: memberIds };
      
      if (status === 'PendingApproval') {
        const excludedRows = await prisma.$queryRaw<{id: string}[]>`
          SELECT DISTINCT cv.id 
          FROM cv_profiles cv
          JOIN approval_logs al ON cv.id = al.cv_profile_id
          WHERE al.level = 1 
            AND cv.submitted_at IS NOT NULL
            AND al.created_at >= cv.submitted_at
        `;
        const excludedIds = excludedRows.map(r => r.id);
        if (excludedIds.length > 0) {
          where.id = { notIn: excludedIds };
        }
      }
    }

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

    const dataWithSLA = data.map((cv) => {
      let slaStatus = 'Safe';
      if (cv.status === CVStatus.PendingApproval && cv.submittedAt) {
        const diffHours = (new Date().getTime() - new Date(cv.submittedAt).getTime()) / (1000 * 60 * 60);
        if (diffHours >= 48) {
          slaStatus = 'Overdue';
        } else if (diffHours >= 24) {
          slaStatus = 'Warning';
        }
      }
      return { ...cv, slaStatus };
    });

    return { total, page, data: dataWithSLA };
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

    const draft = cv.sectionsData || {};
    const original = cv.histories.length > 0 ? cv.histories[0].snapshotData : {};

    const diffChanges = generateDiff(original, draft);

    return diffChanges;
  }

  async copyLocalization(sourceCvId: string, targetLanguageCode: string, userId: string, role: string) {
    const sourceCv = await prisma.cVProfile.findUnique({ where: { id: sourceCvId } });
    if (!sourceCv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (sourceCv.userId !== userId && !['HR', 'Admin'].includes(role)) {
      throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
    }

    let targetCv = await prisma.cVProfile.findUnique({
      where: {
        userId_languageCode: {
          userId,
          languageCode: targetLanguageCode,
        },
      },
    });

    if (!targetCv) {
      // Create new CV with copied sectionsData
      targetCv = await prisma.cVProfile.create({
        data: {
          userId,
          languageCode: targetLanguageCode,
          status: CVStatus.Draft,
          sectionsData: sourceCv.sectionsData as any,
        },
      });
    } else {
      // Overwrite existing CV
      if (targetCv.status === CVStatus.PendingApproval) {
        throw new BadRequestError('Cannot overwrite a CV that is pending approval.');
      }

      targetCv = await prisma.cVProfile.update({
        where: { id: targetCv.id },
        data: {
          sectionsData: sourceCv.sectionsData as any,
          status: CVStatus.Draft,
        },
      });
    }

    return targetCv;
  }
}
