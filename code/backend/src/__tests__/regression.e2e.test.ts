import request from 'supertest';

const API_URL = 'http://localhost:3000';

describe('E2E Regression Testing - UmiCV API', () => {
  let adminToken = '';
  let employeeToken = '';

  beforeAll(async () => {
    // 1. Authenticate to get tokens
    const adminLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' }); // assume password123 or 123456

    if (adminLogin.status !== 200) {
      const adminLoginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      adminToken = adminLoginFallback.body?.data?.accessToken;
    } else {
      adminToken = adminLogin.body?.data?.accessToken;
    }

    const empLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testemployee', password: 'password123' });

    if (empLogin.status !== 200) {
      const empLoginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'testemployee', password: '123456' });
      employeeToken = empLoginFallback.body?.data?.accessToken;
    } else {
      employeeToken = empLogin.body?.data?.accessToken;
    }
  });

  describe('1. Authentication & Authorization (RBAC)', () => {
    it('should deny access to GET /api/users without token (401)', async () => {
      const res = await request(API_URL).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('should deny Employee access to Admin route POST /api/departments (403)', async () => {
      const res = await request(API_URL)
        .post('/api/departments')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ name: 'Test Dept' });
      expect(res.status).toBe(403);
    });

    it('should allow Admin to access GET /api/users (200)', async () => {
      const res = await request(API_URL)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('2. Data Violations & Missing Data', () => {
    it('should return 400 when creating department without name', async () => {
      const res = await request(API_URL)
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // Missing name
      expect(res.status).toBe(400);
    });

    it('should return 400 when updating profile with invalid email', async () => {
      const res = await request(API_URL)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ email: 'invalid-email' });
      expect(res.status).toBe(400);
    });
    
    it('should ignore restricted fields when Employee updates profile (Privilege Escalation attempt)', async () => {
      const res = await request(API_URL)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ fullName: 'Updated Name', role: 'Admin', status: 'Locked' });
      
      // Zod .strict() will actually return 400 Bad Request because of extra fields
      expect(res.status).toBe(400);
    });
  });

  describe('3. Business Logic Edge Cases', () => {
    it('should return 404 when getting non-existent CV', async () => {
      const fakeUuid = '12345678-1234-1234-1234-123456789012';
      const res = await request(API_URL)
        .get(`/api/cvs/${fakeUuid}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when cancelling non-existent Batch Request', async () => {
      const fakeUuid = '12345678-1234-1234-1234-123456789012';
      const res = await request(API_URL)
        .post(`/api/batch-requests/${fakeUuid}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
