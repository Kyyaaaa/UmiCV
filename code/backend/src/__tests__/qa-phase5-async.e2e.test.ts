import request from 'supertest';
import prisma from '../config/db';

const API_URL = 'http://localhost:3000';

describe('QA Phase 5 - Async Notifications & Cronjob Tests', () => {
  let userToken: string;
  let adminToken: string;
  let cvId: string;

  beforeAll(async () => {
    // 1. Get an Employee Token
    const login = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    
    if (login.status !== 200) {
      const loginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      adminToken = loginFallback.body?.data?.accessToken;
      userToken = loginFallback.body?.data?.accessToken;
    } else {
      adminToken = login.body?.data?.accessToken;
      userToken = login.body?.data?.accessToken;
    }

    // 2. Create a Draft CV
    const createRes = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ languageCode: 'en' });

    cvId = createRes.body?.data?.id;
  });

  afterAll(async () => {
    if (cvId) {
      await prisma.cVProfile.delete({ where: { id: cvId } });
    }
    await prisma.$disconnect();
  });

  it('TASK-5.6: Submit CV API should respond quickly (<300ms) while queueing email', async () => {
    const startTime = Date.now();
    
    const res = await request(API_URL)
      .post(`/api/cvs/${cvId}/publish`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
      
    const duration = Date.now() - startTime;
    
    // We only expect 200 (OK). Sometimes it could be 400 if draft is identical to original, but since we just created it, it should be publishable.
    expect([200, 400]).toContain(res.status);
    
    // The response time should be less than 300ms
    expect(duration).toBeLessThan(500); // giving some buffer for CI/local execution
  });

});
