import request from 'supertest';
import app from '../app';
import prisma from '../config/db';
import { MESSAGES } from '../constants/messages';

const API_URL = app;

describe('QA Phase 27 - Localization Testing', () => {
  let adminToken = '';
  let employeeToken = '';
  let hrToken = '';
  const testUser = 'qa27_employee';
  const hrUser = 'qa27_hr';
  let employeeId = '';
  let hrId = '';

  beforeAll(async () => {
    // 1. Get Admin Token
    const adminLoginRes = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLoginRes.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123123123@As' })).body?.data?.accessToken;

    // Clean up
    await prisma.batchRequestTarget.deleteMany({ where: { user: { username: { startsWith: 'qa27' } } } });
    await prisma.batchRequest.deleteMany({ where: { creator: { username: hrUser } } });
    await prisma.cVProfile.deleteMany({ where: { user: { username: testUser } } });
    await prisma.user.deleteMany({ where: { username: { in: [testUser, hrUser] } } });

    // 2. Setup Data
    const dept = await prisma.department.findFirst();
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123123123@As', 10);
    
    const u = await prisma.user.create({
        data: {
            username: testUser,
            email: 'qa27@example.com',
            fullName: 'QA27 Employee',
            passwordHash: hash,
            role: 'Employee',
            departmentId: dept?.id || ''
        }
    });
    employeeId = u.id;

    const hr = await prisma.user.create({
        data: {
            username: hrUser,
            email: 'qa27hr@example.com',
            fullName: 'QA27 HR',
            passwordHash: hash,
            role: 'HR',
            departmentId: dept?.id || ''
        }
    });
    hrId = hr.id;

    const empLogin = await request(API_URL).post('/api/auth/login').send({ username: testUser, password: '123123123@As' });
    employeeToken = empLogin.body.data.accessToken;

    const hrLogin = await request(API_URL).post('/api/auth/login').send({ username: hrUser, password: '123123123@As' });
    hrToken = hrLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.batchRequestTarget.deleteMany({ where: { user: { username: { startsWith: 'qa27' } } } });
    await prisma.batchRequest.deleteMany({ where: { creator: { username: hrUser } } });
    await prisma.cVProfile.deleteMany({ where: { user: { username: testUser } } });
    await prisma.user.deleteMany({ where: { username: { in: [testUser, hrUser] } } });
  });

  it('1. Forgot password should return proper success message', async () => {
    const res = await request(API_URL)
      .post('/api/auth/forgot-password')
      .send({ email: 'qa27@example.com' });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS);
  });

  it('2. Invalid reset password token should return Vietnamese error', async () => {
    const res = await request(API_URL)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid_token_123', newPassword: 'NewPassword123@' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(MESSAGES.AUTH.RESET_PASSWORD_INVALID);
  });

  it('3. Duplicate CV language should return Vietnamese error', async () => {
    // Create first CV
    await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ languageCode: 'vi' });

    // Create duplicate
    const res = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ languageCode: 'vi' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(MESSAGES.CV.DUPLICATE_LANGUAGE);
  });

  it('4. Remind target should return proper Vietnamese message', async () => {
    // Create batch and target
    const batchRes = await request(API_URL)
      .post('/api/batch-requests')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'QA 27 Batch',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        targetUserIds: [employeeId]
      });

    const batchId = batchRes.body.data.id;

    const res = await request(API_URL)
      .post(`/api/batch-requests/${batchId}/targets/${employeeId}/remind`)
      .set('Authorization', `Bearer ${hrToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MESSAGES.BATCH_REQUEST.REMINDER_SUCCESS);
  });

  it('5. Cancel batch request should return proper Vietnamese message', async () => {
    const batchRes = await request(API_URL)
      .post('/api/batch-requests')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'QA 27 Batch Cancel',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        targetUserIds: []
      });

    const batchId = batchRes.body.data.id;

    const res = await request(API_URL)
      .post(`/api/batch-requests/${batchId}/cancel`)
      .set('Authorization', `Bearer ${hrToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MESSAGES.BATCH_REQUEST.CANCEL_SUCCESS);
  });
});
