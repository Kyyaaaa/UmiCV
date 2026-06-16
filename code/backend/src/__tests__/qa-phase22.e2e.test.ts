import request from 'supertest';
import prisma from '../config/db';
import app from '../app';

const API_URL = app;

describe('QA Phase 22 - Admin User Management (Reset Password & Soft Delete)', () => {
  let adminToken = '';
  let adminId = '';
  let empToken = '';
  let empId = '';
  const empUsername = 'testemployee_qa22';
  const empEmail = 'testemployee_qa22@example.com';

  beforeAll(async () => {
    // Authenticate Admin
    const adminLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;
    
    const adminMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${adminToken}`);
    adminId = adminMe.body.data.id;

    // Clean up if exists
    await prisma.user.deleteMany({ where: { username: empUsername } });

    // Create a new employee for this test using the admin API
    const createRes = await request(API_URL)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: empUsername,
        email: empEmail,
        fullName: 'QA 22 Employee',
        password: 'password123',
        role: 'Employee'
        // departmentId is not strictly required if nullable, otherwise we might need a default.
        // Assuming user creation works without it based on schema or it handles null.
      });

    // If create fails because of departmentId, we'll fetch a dummy department
    if (createRes.status !== 201) {
      const dept = await prisma.department.findFirst();
      const res2 = await request(API_URL)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: empUsername,
          email: empEmail,
          fullName: 'QA 22 Employee',
          password: 'password123',
          role: 'Employee',
          departmentId: dept?.id
        });
      empId = res2.body.data.id;
    } else {
      empId = createRes.body.data.id;
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: empUsername } });
  });

  it('should prevent admin from deleting themselves', async () => {
    const res = await request(API_URL)
      .delete(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/không thể/i); // Cannot delete self or admin
  });

  it('should allow admin to reset employee password', async () => {
    const res = await request(API_URL)
      .post(`/api/users/${empId}/reset-password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPassword: 'newpassword123' });
    
    expect(res.status).toBe(200);

    // Verify login with new password works
    const loginRes = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: empUsername, password: 'newpassword123' });
    
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
    empToken = loginRes.body.data.accessToken; // Store token if needed
  });

  it('should allow admin to soft delete employee', async () => {
    const res = await request(API_URL)
      .delete(`/api/users/${empId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);

    // Verify user is soft deleted (deletedAt is set)
    const userInDb = await prisma.user.findUnique({ where: { id: empId } });
    expect(userInDb?.deletedAt).not.toBeNull();
  });

  it('should prevent soft-deleted employee from logging in', async () => {
    const loginRes = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: empUsername, password: 'newpassword123' });
    
    // API returns 401 Unauthorized for deleted users usually, or 404
    expect(loginRes.status).toBe(401); 
  });
});
