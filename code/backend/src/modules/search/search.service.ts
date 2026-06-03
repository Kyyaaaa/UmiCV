import prisma from '../../config/db';
import { SearchInput } from './search.dto';
import { NotFoundError } from '../../errors/AppError';
import { Prisma } from '@prisma/client';

export class SearchService {
  async searchCVs(query: SearchInput) {
    const { keyword, departmentId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CVProfileWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.user = {
        departmentId,
      };
    }

    if (keyword) {
      // Basic text search. For advanced JSONB GIN index search, raw SQL is typically better,
      // but Prisma can query JSON fields using path or string content.
      // Since sectionsData is unstructured JSON, we might cast it to text and search, or use raw SQL.
      // For simplicity in ORM, we do a raw query or Prisma json search if supported.
      // Using raw query for keyword search against sectionsData.
    }

    // Since Prisma's JSON filtering is a bit limited for full text search across the whole JSON object,
    // let's use Prisma ORM for basic filters, and if keyword exists, we might need raw query or just simple user name search.
    // Assuming keyword searches User's name/username or basic JSON structure.
    if (keyword) {
      where.OR = [
        { user: { username: { contains: keyword, mode: 'insensitive' } } },
        { sectionsData: { string_contains: keyword } } // Prisma supports string_contains for JSON arrays in some DBs, or we use raw later.
      ];
    }

    const [total, data] = await Promise.all([
      prisma.cVProfile.count({ where }),
      prisma.cVProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, department: true },
          },
        },
      }),
    ]);

    return { total, page, data };
  }

  async diffCV(cvId: string) {
    const cv = await prisma.cVProfile.findUnique({
      where: { id: cvId },
      include: {
        histories: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!cv) {
      throw new NotFoundError('CV not found');
    }

    const draft = cv.sectionsData;
    const original = cv.histories.length > 0 ? cv.histories[0].snapshotData : null;

    // Diff logic is usually handled better on Frontend (e.g. jsdiff), backend just provides both versions.
    return {
      original,
      draft,
      // diff could be computed here if using a library, but usually returning both is enough for UI
    };
  }
}
