import request from 'supertest';
import prisma from '../config/db';
import { emailQueue } from '../modules/notification/notification.queue';
import app from '../app';

// Mock email queue so it doesn't actually attempt to connect to redis/send email
jest.mock('../modules/notification/notification.queue', () => ({
  emailQueue: {
    add: jest.fn(),
  },
}));

const API_URL = app;

describe('QA Phase 21 - Forgot Password & Reset Password Flow', () => {
  let empEmail = '';
  let empUsername = 'testemployee';
  let capturedToken = '';

  beforeAll(async () => {
    const empMe = await prisma.user.findFirst({ where: { username: empUsername }});
    if (!empMe) throw new Error('testemployee not found in DB');
    empEmail = empMe.email;
  });

  afterAll(async () => {
    // Reset password back to 'password123'
    const tokenLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: empUsername, password: 'newpassword456' });
    
    // We can't easily reset without the flow, but wait, we can just use the DB or just run the flow again!
    // Or we just update the DB with bcrypt hash of 'password123'
    // But since it's an E2E test on localhost, we can just leave it as newpassword456, 
    // or run the flow again to revert. Let's just restore via DB update to be safe for other tests.
    // However, bcrypt is needed.
  });

  it('should generate reset token and trigger emailQueue', async () => {
    const res = await request(API_URL)
      .post('/api/auth/forgot-password')
      .send({ email: empEmail });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If that email address is in our database/);

    // Verify emailQueue.add was called
    expect(emailQueue.add).toHaveBeenCalledWith(
      'forgot-password',
      expect.objectContaining({
        to: empEmail,
      })
    );

    // Extract token from the mock call
    const callArgs = (emailQueue.add as jest.Mock).mock.calls[0];
    const bodyText = callArgs[1].body;
    // Body contains resetUrl like: http://localhost:5173/reset-password?token=XYZ
    const tokenMatch = bodyText.match(/token=([a-f0-9]+)/);
    expect(tokenMatch).toBeTruthy();
    capturedToken = tokenMatch[1];
  });

  it('should reset the password successfully', async () => {
    const res = await request(API_URL)
      .post('/api/auth/reset-password')
      .send({
        token: capturedToken,
        newPassword: 'newpassword456',
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should login with new password and fail with old password', async () => {
    // Attempt login with old password
    const failRes = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: empUsername, password: 'password123' });
    
    expect(failRes.status).toBe(401);

    // Attempt login with new password
    const successRes = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: empUsername, password: 'newpassword456' });
    
    expect(successRes.status).toBe(200);
    expect(successRes.body.data.accessToken).toBeDefined();
  });

  it('should restore the original password', async () => {
    // We just restore via DB to avoid testing the API again and relying on mock counts
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    await prisma.user.update({
      where: { email: empEmail },
      data: { passwordHash: hash }
    });
  });
});
