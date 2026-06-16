import request from 'supertest';
import prisma from '../config/db';
import { CVStatus, BatchRequestStatus } from '@prisma/client';

const API_URL = 'http://localhost:3000';

describe('QA Phase 19 - Batch Request Update & Delete API', () => {
  let hrToken = '';
  let hrId = '';
  let empId = '';
  let mockBatchRequestId = '';
  let mockCvId = '';

  beforeAll(async () => {
    // Authenticate HR (Admin also works, but we use admin for now)
    const hrLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    hrToken = hrLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;
    
    const hrMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${hrToken}`);
    hrId = hrMe.body.data.id;

    // Get an employee ID
    const empMe = await prisma.user.findFirst({ where: { username: 'testemployee' }});
    empId = empMe!.id;

    // Clean up
    await prisma.batchRequest.deleteMany({ where: { title: 'QA Phase 19 Delete Test' }});
    await prisma.cVProfile.deleteMany({ where: { userId: empId } });

    // Create CV Draft for Employee
    const cv = await prisma.cVProfile.create({
      data: {
        userId: empId,
        languageCode: 'vi',
        status: CVStatus.Draft,
        versionNumber: 1,
      }
    });
    mockCvId = cv.id;
  });

  afterAll(async () => {
    await prisma.batchRequest.deleteMany({ where: { title: 'QA Phase 19 Delete Test' }});
    await prisma.cVProfile.deleteMany({ where: { userId: empId } });
  });

  it('should create a batch request successfully and turn CV to Outdated', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const res = await request(API_URL)
      .post('/api/batch-requests')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'QA Phase 19 Delete Test',
        description: 'Testing Delete',
        deadline: futureDate.toISOString(),
        targetUserIds: [empId]
      });

    expect(res.status).toBe(201);
    mockBatchRequestId = res.body.data.id;

    // Verify CV is Outdated
    const cv = await prisma.cVProfile.findUnique({ where: { id: mockCvId } });
    expect(cv?.status).toBe(CVStatus.Outdated);
  });

  it('should fail to update Deadline to a past date', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const res = await request(API_URL)
      .put(`/api/batch-requests/${mockBatchRequestId}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        deadline: pastDate.toISOString()
      });

    expect(res.status).toBe(400); // Bad request due to validation
  });

  it('should successfully update title', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const res = await request(API_URL)
      .put(`/api/batch-requests/${mockBatchRequestId}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'QA Phase 19 Delete Test Updated',
        deadline: futureDate.toISOString(),
        targetUserIds: [empId] // Keeping the same target
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('QA Phase 19 Delete Test Updated');
  });

  it('should delete Active batch request and rollback CV to Draft', async () => {
    // Delete
    const res = await request(API_URL)
      .delete(`/api/batch-requests/${mockBatchRequestId}`)
      .set('Authorization', `Bearer ${hrToken}`);
      
    expect(res.status).toBe(200);

    // Verify BatchRequest is gone
    const batch = await prisma.batchRequest.findUnique({ where: { id: mockBatchRequestId } });
    expect(batch).toBeNull();

    // Verify CV reverted to Draft
    const cv = await prisma.cVProfile.findUnique({ where: { id: mockCvId } });
    expect(cv?.status).toBe(CVStatus.Draft);
  });
});
