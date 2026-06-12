import request from 'supertest';
import prisma from '../config/db';

const API_URL = 'http://localhost:3000';

describe('QA Phase 8 - CV Structure Validation Tests', () => {
  let userToken: string;
  let cvId: string;

  beforeAll(async () => {
    // 1. Get an Employee Token (or Admin, doesn't matter for validation)
    const login = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    
    let userId: string;
    if (login.status !== 200) {
      const loginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      userToken = loginFallback.body?.data?.accessToken;
      userId = loginFallback.body?.data?.user?.id;
    } else {
      userToken = login.body?.data?.accessToken;
      userId = login.body?.data?.user?.id;
    }

    // Delete existing CV for the user if exists
    if (userId) {
      await prisma.cVProfile.deleteMany({
        where: { userId }
      });
    }

    // 2. Create a Draft CV
    const createRes = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ languageCode: 'vi' });

    cvId = createRes.body?.data?.id;
    if (!cvId) {
      console.log('PHASE 8 CREATE ERROR:', createRes.status, createRes.body);
    }
  });

  afterAll(async () => {
    // Clean up created CV
    if (cvId) {
      await prisma.cVProfile.delete({ where: { id: cvId } });
    }
    await prisma.$disconnect();
  });

  it('TASK-8.5: API should reject payload containing custom/unknown sections', async () => {
    const maliciousPayload = {
      sectionsData: {
        personalInfo: { name: 'Test User' },
        hackedSection: 'This is malicious data' // Custom section not allowed by schema
      }
    };

    const res = await request(API_URL)
      .put(`/api/cvs/${cvId}/draft`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(maliciousPayload);

    // Expected to be 400 Bad Request because of Zod .strict()
    expect(res.status).toBe(400);
    // Check if the error message mentions the unrecognized key
    expect(JSON.stringify(res.body.errors || res.body)).toMatch(/hackedSection|Unrecognized key/i);
  });

  it('TASK-8.5: API should accept payload with valid sections only', async () => {
    const validPayload = {
      sectionsData: {
        personalInfo: { name: 'Test User' },
        skills: [{ name: 'React' }]
      }
    };

    const res = await request(API_URL)
      .put(`/api/cvs/${cvId}/draft`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(validPayload);

    if (res.status !== 200) {
      console.log('PHASE 8 ERROR:', JSON.stringify(res.body, null, 2));
    }

    expect(res.status).toBe(200);
    expect(res.body.data.sectionsData.skills[0].name).toBe('React');
  });
});
