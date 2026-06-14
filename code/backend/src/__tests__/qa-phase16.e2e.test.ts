import request from 'supertest';
import prisma from '../config/db';

const API_URL = 'http://localhost:3000';

describe('QA Phase 16 - Dashboard API RBAC', () => {
  let adminToken = '';
  let empToken = '';
  let empId = '';

  beforeAll(async () => {
    // Authenticate Admin
    const adminLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;

    // Authenticate Employee
    const empLogin = await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: 'password123' });
    empToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;
    
    const empMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${empToken}`);
    empId = empMe.body.data.id;
  });

  it('should return company-wide stats for Admin', async () => {
    const res = await request(API_URL)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('pending');

    // Verify with DB
    const dbTotal = await prisma.cVProfile.count();
    expect(res.body.data.total).toBe(dbTotal);
  });

  it('should return individual stats for Employee', async () => {
    const res = await request(API_URL)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${empToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('pending');

    // Verify with DB (Employee should only see their own CV count, which is at most 1 in this app)
    const dbTotal = await prisma.cVProfile.count({ where: { userId: empId } });
    expect(res.body.data.total).toBe(dbTotal);
    expect(res.body.data.total).toBeLessThanOrEqual(1);
  });
});
