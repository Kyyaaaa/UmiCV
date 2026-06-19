import request from 'supertest';
import prisma from '../config/db';
import app from '../app';

const API_URL = app;

describe('QA Phase 24 - Security Hardening', () => {
  let empToken = '';
  let empId = '';

  const testUser = 'phase24_user';
  const testPass = '123123123@As';

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { username: testUser } });

    // Create user using Prisma to bypass login/create API limits
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(testPass, 10);
    
    // Get a department
    const dept = await prisma.department.findFirst();
    
    const user = await prisma.user.create({
      data: {
        username: testUser,
        email: 'phase24@example.com',
        fullName: 'Phase 24 User',
        passwordHash: hash,
        role: 'Employee',
        departmentId: dept?.id || ''
      }
    });
      
    empId = user.id;

    // Login as the new user to get a valid token
    const empLogin = await request(API_URL).post('/api/auth/login').send({ username: testUser, password: testPass });
    empToken = empLogin.body?.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: testUser } });
  });

  it('should sanitize XSS payload in input', async () => {
    // We send an XSS payload in update profile
    const payload = '<script>alert("xss")</script>Test Name';
    
    const res = await request(API_URL)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ fullName: payload, email: 'phase24@example.com' });
    
    expect(res.status).toBe(200);
    
    // xss-clean converts '<script>...' to '&lt;script&gt;...' or removes it
    const meRes = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${empToken}`);
    const savedName = meRes.body.data.fullName;
    
    expect(savedName).not.toContain('<script>');
  });

  it('should invalidate old tokens when password is changed (Token Versioning)', async () => {
    // 1. Change password using empToken (this should bump tokenVersion in DB)
    const changePassRes = await request(API_URL)
      .put('/api/users/me/password')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ oldPassword: testPass, newPassword: 'NewPassword123@' });
    
    expect(changePassRes.status).toBe(200);

    // 2. Try to use the old token to access a protected route
    const oldTokenRes = await request(API_URL)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${empToken}`);
    
    // 3. Expect 401 Unauthorized because the tokenVersion in DB is now higher than the one in empToken payload
    expect(oldTokenRes.status).toBe(401);
  });

  it('should enforce Rate Limiting on Login (429 Too Many Requests)', async () => {
    // Run this last so it doesn't affect other tests if limit kicks in early
    let lastStatus = 200;
    for (let i = 0; i < 6; i++) {
      const res = await request(API_URL).post('/api/auth/login').send({ username: 'wrong', password: 'wrong' });
      lastStatus = res.status;
    }
    // The rate limit max is 5, so the 6th should be 429
    expect(lastStatus).toBe(429);
  });
});
