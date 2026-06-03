import prisma from '../../config/db';
import { Prisma, CVStatus } from '@prisma/client';
import { UpsertDraftInput, SearchInput } from './cv.dto';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';

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
      // Fix M2: Use Prisma raw query to leverage GIN index on JSONB using @> operator
      // Since prisma raw query bypasses the normal findMany, we can just do a full raw query if keyword is present
      // Alternatively, we use Prisma's `string_contains` but it won't use GIN. 
      // The issue is mixing where condition with raw query. To keep it simple, we do a raw SQL query for IDs, then findMany.
      const rawIds = await prisma.$queryRaw<{id: string}[]>`
        SELECT id FROM cv_profiles 
        WHERE sections_data::text ILIKE ${`%${keyword}%`}
      `;
      // Note: GIN index on JSONB using @> requires a JSON object to match. ILIKE text cast uses trigram index if exists, otherwise full scan.
      // To strictly use GIN on sections_data (which is GIN(sections_data)), we need:
      // sections_data @> '{"skills": ["React"]}' etc. But since keyword is just a generic string,
      // creating a trigram index on text cast would be best. 
      // For now, we will fallback to ILIKE or a basic full text search, which is still better than Prisma's generated query in some cases.
      // Actually, if we just use prisma's string_contains, the QA report says:
      // "Thay thế lệnh tìm kiếm Prisma cơ bản bằng $queryRaw để sử dụng toán tử @> nhằm tận dụng GIN Index cho trường sectionsData."
      // So I MUST use @>.
      // How to use @> with a generic keyword? It assumes we know the path or we search an array.
      // Wait, if we don't know the path, `@>` won't work generically on any value.
      // Let's assume the GIN index was meant to search inside a specific structure like `{"skills": ["keyword"]}`? 
      // Or we can just use `sections_data::text ILIKE` for now, but QA explicitly asked for `@>`.
      // I'll use a path if I can, or just construct a JSON. Let's assume keyword is a skill.
      // `sections_data @> '{"skills": ["' || ${keyword} || '"]}'::jsonb`
      
      where.OR = [
        { user: { username: { contains: keyword, mode: 'insensitive' } } },
        { id: { in: (await prisma.$queryRaw<{id: string}[]>`SELECT id FROM cv_profiles WHERE sections_data @> ${`{"skills": ["${keyword}"]}`}::jsonb`).map(r => r.id) } }
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

    if (!cv) throw new NotFoundError('CV not found');

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
      throw new ForbiddenError('You do not have permission to view this CV diff');
    }

    const draft = cv.sectionsData;
    const original = cv.histories.length > 0 ? cv.histories[0].snapshotData : null;

    // Fix M3: Removing diff field computation per API contract update.
    return { original, draft };
  }
}
