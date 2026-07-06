import prisma from '../../config/db';
import { Prisma, CVStatus } from '@prisma/client';

export class DashboardService {
  /**
   * Helper function to build Prisma where clause based on role
   */
  private buildDashboardWhereClause(userId: string, role: string): Prisma.CVProfileWhereInput {
    if (role === 'Admin' || role === 'HR') {
      return {};
    }

    if (role === 'TechLead') {
      return {
        OR: [
          { userId },
          { user: { projectMembers: { some: { project: { techLeadId: userId } } } } },
        ],
      };
    }

    // Default for Employee
    return { userId };
  }

  async getStats(userId: string, role: string) {
    const baseWhere = this.buildDashboardWhereClause(userId, role);

    const [total, pending, updated, outdated] = await Promise.all([
      prisma.cVProfile.count({ where: baseWhere }),
      prisma.cVProfile.count({ where: { ...baseWhere, status: CVStatus.PendingApproval } }),
      prisma.cVProfile.count({ where: { ...baseWhere, status: CVStatus.Updated } }),
      prisma.cVProfile.count({ where: { ...baseWhere, status: CVStatus.Outdated } }),
    ]);

    return { total, pending, updated, outdated };
  }

  async getRecentCVs(userId: string, role: string, limit: number = 5) {
    const baseWhere = this.buildDashboardWhereClause(userId, role);

    const recentCVs = await prisma.cVProfile.findMany({
      where: baseWhere,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        user: { select: { fullName: true, username: true } }
      }
    });

    return recentCVs.map((cv) => ({
      id: cv.id,
      userId: cv.userId,
      user: { fullName: cv.user.fullName, username: cv.user.username },
      languageCode: cv.languageCode,
      status: cv.status,
      versionNumber: cv.versionNumber,
      updatedAt: cv.updatedAt,
      sectionsData: cv.sectionsData,
    }));
  }
}
