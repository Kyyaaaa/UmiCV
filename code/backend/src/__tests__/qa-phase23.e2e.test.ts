import request from 'supertest';
import prisma from '../config/db';
import app from '../app';

const API_URL = app;

describe('QA Phase 23 - System Logs (Audit & Approval Logs)', () => {
  let adminToken = '';
  let adminId = '';
  let empToken = '';

  beforeAll(async () => {
    // Authenticate Admin
    const adminLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;
    const adminMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${adminToken}`);
    adminId = adminMe.body.data.id;

    // Authenticate Employee
    const empLogin = await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: 'password123' });
    empToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup audit logs created by test (optional, but good for cleanliness)
    // We can't easily distinguish test logs from real ones unless we use timestamps or specific actions.
    // It's okay to leave audit logs in E2E since they are just logs.
  });

  it('should deny Employee from accessing Approval Logs and Audit Logs', async () => {
    const resApproval = await request(API_URL)
      .get('/api/cvs/approval-logs/all')
      .set('Authorization', `Bearer ${empToken}`);
    
    // Employee shouldn't access HR/Admin route, maybe 403 or 404 if not found
    // Depending on routing, it should be 403 Forbidden
    expect(resApproval.status).toBe(403);

    const resAudit = await request(API_URL)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${empToken}`);
    
    expect(resAudit.status).toBe(403);
  });

  it('should allow Admin to access Approval Logs and Audit Logs', async () => {
    const resApproval = await request(API_URL)
      .get('/api/cvs/approval-logs/all')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(resApproval.status).toBe(200);
    expect(Array.isArray(resApproval.body.data)).toBe(true);

    const resAudit = await request(API_URL)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(resAudit.status).toBe(200);
    expect(Array.isArray(resAudit.body.data)).toBe(true);
  });

  it('should track login action in Audit Logs', async () => {
    // Do a login
    await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: 'password123' });

    // Wait a brief moment just in case it's async (though typically it's awaited in service)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Fetch logs
    const resAudit = await request(API_URL)
      .get('/api/audit-logs?limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(resAudit.status).toBe(200);
    
    const logs = resAudit.body.data;
    // Look for a login action in the recent logs
    const hasLoginLog = logs.some((log: any) => log.action.toLowerCase().includes('login'));
    expect(hasLoginLog).toBe(true);
  });
});
