import prisma from '../../config/db';

export class AuditService {
  async logAction(action: string, userId?: string, resourceId?: string) {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          userId,
          resourceId,
        },
      });
    } catch (error) {
      console.error('Failed to log action:', error);
      // We don't want audit log failures to break the main application flow
    }
  }

  async getAuditLogs(query: { page: number; limit: number }) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip: offset,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, username: true, role: true },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
