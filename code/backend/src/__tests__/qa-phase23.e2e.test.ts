import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

const API_URL = app;

describe('QA Phase 23 - Audit & Tracking', () => {
  let adminToken = '';
  const testUser = 'phase23_qa_user';
  const testPass = '123123123@As';
  let createdUserId = '';

  beforeAll(async () => {
    // 1. Get Admin Token
    const adminLoginRes = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLoginRes.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123123123@As' })).body?.data?.accessToken;
    
    // Clean up
    await prisma.auditLog.deleteMany({ where: { userId: adminLoginRes.body?.data?.id } });
    await prisma.user.deleteMany({ where: { username: testUser } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: testUser } });
  });

  it('should log action when Admin creates and locks a User', async () => {
    // 1. Create a user
    const dept = await prisma.department.findFirst();
    const createRes = await request(API_URL)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: testUser,
        email: 'phase23@example.com',
        fullName: 'Phase 23 User',
        password: testPass,
        role: 'Employee',
        departmentId: dept?.id || ''
      });
      
    expect(createRes.status).toBe(201);
    createdUserId = createRes.body.data.id;

    // 2. Lock the user
    const lockRes = await request(API_URL)
      .patch(`/api/users/${createdUserId}/lock`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(lockRes.status).toBe(200);

    // 3. Verify in Audit Logs
    const auditRes = await request(API_URL)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(auditRes.status).toBe(200);
    console.log(JSON.stringify(auditRes.body));
    const logs = auditRes.body?.data?.data || auditRes.body?.data || [];
    
    const lockLog = logs.find((log: any) => log.action === 'LOCK_USER' && log.resourceId === createdUserId);
    expect(lockLog).toBeDefined();
  });
});
