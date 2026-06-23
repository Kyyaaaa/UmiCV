import prisma from '../config/db';
import { emailQueue } from '../modules/notification/notification.queue';
import { processOutdatedTargets } from '../modules/notification/notification.cron';

jest.mock('../modules/notification/notification.queue', () => ({
  emailQueue: {
    addBulk: jest.fn(),
    add: jest.fn(),
  }
}));

describe('QA Phase 30 - Auto Remind Cronjob', () => {
  let userIds: string[] = [];
  let hrId = '';

  beforeAll(async () => {
    // Clean up
    await prisma.notification.deleteMany({ where: { user: { username: { startsWith: 'qa30' } } } });
    await prisma.batchRequestTarget.deleteMany({ where: { user: { username: { startsWith: 'qa30' } } } });
    await prisma.batchRequest.deleteMany({ where: { title: { startsWith: 'QA 30' } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa30' } } });

    // Setup Data
    const dept = await prisma.department.findFirst();
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123123123@As', 10);

    const hr = await prisma.user.create({
        data: {
            username: 'qa30_hr',
            email: 'qa30_hr@example.com',
            fullName: 'QA30 HR',
            passwordHash: hash,
            role: 'HR',
            departmentId: dept?.id || ''
        }
    });
    hrId = hr.id;
    
    // Create 2 employees
    for(let i=1; i<=2; i++) {
        const u = await prisma.user.create({
            data: {
                username: `qa30_emp_${i}`,
                email: `qa30_emp_${i}@example.com`,
                fullName: `QA30 Employee ${i}`,
                passwordHash: hash,
                role: 'Employee',
                departmentId: dept?.id || ''
            }
        });
        userIds.push(u.id);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { user: { username: { startsWith: 'qa30' } } } });
    await prisma.batchRequestTarget.deleteMany({ where: { user: { username: { startsWith: 'qa30' } } } });
    await prisma.batchRequest.deleteMany({ where: { title: { startsWith: 'QA 30' } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa30' } } });
  });

  it('Should send reminders for deadline within 48h and ignore >48h', async () => {
    // Batch 1: deadline 3 weeks
    const batch1 = await prisma.batchRequest.create({
      data: {
        title: 'QA 30 Batch 3 Weeks',
        createdBy: hrId,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        status: 'Active'
      }
    });
    await prisma.batchRequestTarget.create({
      data: {
        batchRequestId: batch1.id,
        userId: userIds[0],
        status: 'Outdated'
      }
    });

    // Batch 2: deadline 24h
    const batch2 = await prisma.batchRequest.create({
      data: {
        title: 'QA 30 Batch 24 Hours',
        createdBy: hrId,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'Active'
      }
    });
    await prisma.batchRequestTarget.create({
      data: {
        batchRequestId: batch2.id,
        userId: userIds[1],
        status: 'Outdated'
      }
    });

    // Count notifications before
    const notifsBefore = await prisma.notification.count({
      where: { userId: { in: userIds } }
    });

    // Process cronjob logic
    await processOutdatedTargets();

    // Verify queue was called for batch2
    const calls = (emailQueue.add as jest.Mock).mock.calls;
    const ourCall = calls.find(c => c[1].to === 'qa30_emp_2@example.com');
    
    expect(ourCall).toBeDefined();
    expect(ourCall[1].subject).toContain('QA 30 Batch 24 Hours');

    // Make sure batch1 (3 weeks) was NOT called
    const ignoredCall = calls.find(c => c[1].to === 'qa30_emp_1@example.com');
    expect(ignoredCall).toBeUndefined();

    // Count notifications after
    const notifsAfter = await prisma.notification.count({
      where: { userId: { in: userIds } }
    });

    expect(notifsAfter - notifsBefore).toBe(1);

    // Verify the in-app notification content
    const notif = await prisma.notification.findFirst({
      where: { userId: userIds[1] },
      orderBy: { createdAt: 'desc' }
    });
    expect(notif?.title).toBe('Sắp hết hạn cập nhật CV');
    expect(notif?.message).toContain('QA 30 Batch 24 Hours');
  });
});
