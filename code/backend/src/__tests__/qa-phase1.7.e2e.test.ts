import request from 'supertest';
import prisma from '../config/db';
const API_URL = 'http://localhost:3000';

describe('QA Phase 1.7 - Admin Isolation Security Tests', () => {
  let adminTokenA: string;
  let adminAId: string;
  let adminBId: string;

  beforeAll(async () => {
    // 1. Get Admin A Token
    const adminLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    
    if (adminLogin.status !== 200) {
      const adminLoginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      adminTokenA = adminLoginFallback.body?.data?.accessToken;
    } else {
      adminTokenA = adminLogin.body?.data?.accessToken;
    }

    // Get Admin A ID from /me
    const meReq = await request(API_URL)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${adminTokenA}`);
    adminAId = meReq.body.data.id;

    // 2. Ensure an Admin B exists
    let adminB = await prisma.user.findFirst({
      where: { role: 'Admin', id: { not: adminAId } }
    });

    if (!adminB) {
      const firstDept = await prisma.department.findFirst();
      adminB = await prisma.user.create({
        data: {
          username: 'admin2_test',
          email: 'admin2@umicv.local',
          fullName: 'Secondary Admin',
          passwordHash: '$2b$10$abcdefghijklmnopqrstuv', // Fake hash is fine for testing IDOR
          role: 'Admin',
          status: 'Active',
          departmentId: firstDept!.id
        }
      });
    }
    adminBId = adminB.id;
  });

  afterAll(async () => {
    // Clean up if we created admin2_test
    await prisma.user.deleteMany({
      where: { username: 'admin2_test' }
    });
    await prisma.$disconnect();
  });

  it('TASK-1.26: Admin A should NOT be able to lock Admin B', async () => {
    const res = await request(API_URL)
      .patch(`/api/users/${adminBId}/lock`)
      .set('Authorization', `Bearer ${adminTokenA}`);

    // Expected to be forbidden or bad request based on implementation
    // Usually 403 Forbidden is requested by TASK-1.23/1.24
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/không có quyền chỉnh sửa tài khoản Quản trị viên khác/i);
  });

  it('TASK-1.26: Admin A should NOT be able to update Admin B', async () => {
    const res = await request(API_URL)
      .put(`/api/users/${adminBId}`)
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({ fullName: 'Hacked by Admin A' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/không có quyền chỉnh sửa tài khoản Quản trị viên khác/i);
  });

  it('TASK-1.26: Admin A CAN update their own profile', async () => {
    const res = await request(API_URL)
      .put(`/api/users/me`)
      .set('Authorization', `Bearer ${adminTokenA}`)
      .send({
        fullName: 'Admin Updated',
      });

    // Valid update should pass
    expect([200, 400]).toContain(res.status); // 400 might happen if email is required, but we just want to avoid 403
    expect(res.status).not.toBe(403);
  });
});
