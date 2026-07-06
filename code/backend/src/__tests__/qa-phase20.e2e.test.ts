import request from 'supertest';
import prisma from '../config/db';
import { CVStatus } from '@prisma/client';

const API_URL = 'http://localhost:3000';

describe('QA Phase 20 - Publish CV Validation', () => {
  let empToken = '';
  let empId = '';
  let mockCvId = '';

  beforeAll(async () => {
    // Authenticate Employee
    const empLogin = await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: 'password123' });
    empToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;
    
    const empMe = await prisma.user.findFirst({ where: { username: 'testemployee' }});
    empId = empMe!.id;

    // Clean up
    await prisma.cVProfile.deleteMany({ where: { userId: empId } });

    // Create a fully empty Draft CV
    const cv = await prisma.cVProfile.create({
      data: {
        userId: empId,
        languageCode: 'vi',
        status: CVStatus.Draft,
        versionNumber: 1,
        sectionsData: {
          dummyData: 'To bypass NO_CHANGES_TO_PUBLISH'
        } // Completely empty personalInfo
      }
    });
    mockCvId = cv.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.cVProfile.deleteMany({ where: { userId: empId } });
  });

  it('should prevent publishing if missing required personal info', async () => {
    const res = await request(API_URL)
      .post(`/api/cvs/${mockCvId}/publish`)
      .set('Authorization', `Bearer ${empToken}`);
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/thiếu/i); // Expect some error about missing fields
  });

  it('should allow publishing if personal info exists but experience is missing', async () => {
    // First, update the draft to have valid personal info
    await request(API_URL)
      .put(`/api/cvs/${mockCvId}/draft`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        sectionsData: {
          personalInfo: {
            name: 'Nguyen Van A',
            email: 'nguyenvana@example.com',
            role: 'Developer'
          }
        }
      });

    // Now try to publish again
    const res = await request(API_URL)
      .post(`/api/cvs/${mockCvId}/publish`)
      .set('Authorization', `Bearer ${empToken}`);
    
    expect(res.status).toBe(200); // Or 201 depending on your API
    expect(res.body.success).toBe(true);

    // Verify it moved to PendingApproval
    const updatedCv = await prisma.cVProfile.findUnique({ where: { id: mockCvId } });
    expect(updatedCv?.status).toBe(CVStatus.PendingApproval);
  });
});
