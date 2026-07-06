import request from 'supertest';
import app from '../app';
import prisma from '../config/db';
import { emailQueue } from '../modules/notification/notification.queue';

// Mock the bullmq queue methods
jest.mock('../modules/notification/notification.queue', () => ({
  emailQueue: {
    addBulk: jest.fn(),
    add: jest.fn(),
  }
}));

const API_URL = app;

describe('QA Phase 29 - Async Batch Request', () => {
  let hrToken = '';
  let hrId = '';
  let userIds: string[] = [];

  beforeAll(async () => {
    // 1. Clean up first
    await prisma.batchRequestTarget.deleteMany({ where: { user: { username: { startsWith: 'qa29' } } } });
    await prisma.batchRequest.deleteMany({ where: { title: { startsWith: 'QA 29' } } });
    await prisma.cVProfile.deleteMany({ where: { user: { username: { startsWith: 'qa29' } } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa29' } } });

    // 2. Setup Data (HR + 5 users)
    const dept = await prisma.department.findFirst();
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123123123@As', 10);

    const hr = await prisma.user.create({
        data: {
            username: 'qa29_hr',
            email: 'qa29_hr@example.com',
            fullName: 'QA29 HR',
            passwordHash: hash,
            role: 'HR',
            departmentId: dept?.id || ''
        }
    });

    const hrLoginRes = await request(API_URL).post('/api/auth/login').send({ username: 'qa29_hr', password: '123123123@As' });
    hrToken = hrLoginRes.body?.data?.accessToken;
    if (!hrToken) {
        console.error('FAILED TO LOGIN: ', hrLoginRes.body);
    }

    // 2. Setup Data (5 users)

    
    for(let i=1; i<=5; i++) {
        const u = await prisma.user.create({
            data: {
                username: `qa29_emp_${i}`,
                email: `qa29_emp_${i}@example.com`,
                fullName: `QA29 Employee ${i}`,
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
    await prisma.batchRequestTarget.deleteMany({ where: { user: { username: { startsWith: 'qa29' } } } });
    await prisma.batchRequest.deleteMany({ where: { title: { startsWith: 'QA 29' } } });
    await prisma.cVProfile.deleteMany({ where: { user: { username: { startsWith: 'qa29' } } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa29' } } });
  });

  let batchId = '';

  it('1. Create batch request with 3 targets should add 3 email jobs', async () => {
    const targetIds = userIds.slice(0, 3); // 3 users
    const res = await request(API_URL)
      .post('/api/batch-requests')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'QA 29 Batch Create',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        targetUserIds: targetIds
      });
    
    expect(res.status).toBe(201);
    batchId = res.body.data.id;

    // Wait a bit for async process to trigger
    await new Promise(r => setTimeout(r, 500));

    expect(emailQueue.addBulk).toHaveBeenCalledTimes(1);
    const calledArgs = (emailQueue.addBulk as jest.Mock).mock.calls[0][0];
    expect(calledArgs.length).toBe(3); // 3 jobs!
  });

  it('2. Update batch request and add 2 more targets should add 2 email jobs', async () => {
    const newTargetIds = userIds.slice(0, 5); // All 5 users
    const res = await request(API_URL)
      .put(`/api/batch-requests/${batchId}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        targetUserIds: newTargetIds
      });
    
    expect(res.status).toBe(200);

    // Wait a bit for async process
    await new Promise(r => setTimeout(r, 500));

    expect(emailQueue.addBulk).toHaveBeenCalledTimes(1);
    const calledArgs = (emailQueue.addBulk as jest.Mock).mock.calls[0][0];
    expect(calledArgs.length).toBe(2); // Only 2 new jobs!
  });
});
