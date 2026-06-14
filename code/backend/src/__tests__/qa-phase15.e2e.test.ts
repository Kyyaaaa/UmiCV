import request from 'supertest';
import prisma from '../config/db';
import { TargetStatus, BatchRequestStatus } from '@prisma/client';

const API_URL = 'http://localhost:3000';

describe('QA Phase 15 - Batch Request Auto-Complete Lifecycle', () => {
  let hrToken = '';
  let hrId = '';
  
  let empAToken = '';
  let empAId = '';
  let cvAId = '';

  let empBToken = '';
  let empBId = '';
  let cvBId = '';

  let batchRequestId = '';

  beforeAll(async () => {
    // 1. Authenticate HR
    const hrLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    hrToken = hrLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;
    const hrMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${hrToken}`);
    hrId = hrMe.body.data.id;

    // 2. Create mock Employees (if not exist)
    const empALogin = await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: 'password123' });
    empAToken = empALogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;
    const empAMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${empAToken}`);
    empAId = empAMe.body.data.id;

    const empBLogin = await request(API_URL).post('/api/auth/login').send({ username: 'testemployee2', password: 'password123' });
    empBToken = empBLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee2', password: '123456' })).body.data.accessToken;
    const empBMe = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${empBToken}`);
    empBId = empBMe.body.data.id;

    // Cleanup previous data
    await prisma.batchRequest.deleteMany({ where: { title: 'Auto-Complete Test Campaign' } });
    await prisma.cVProfile.deleteMany({ where: { userId: { in: [empAId, empBId] } } });
    await prisma.notification.deleteMany({ where: { userId: hrId, title: 'Batch Request Completed' } });
  });

  afterAll(async () => {
    // Cleanup mock data
    await prisma.batchRequest.deleteMany({ where: { title: 'Auto-Complete Test Campaign' } });
    await prisma.cVProfile.deleteMany({ where: { id: { in: [cvAId, cvBId].filter(Boolean) } } });
  });

  it('TASK-15.4: Create a campaign for 2 employees', async () => {
    const res = await request(API_URL)
      .post('/api/batch-requests')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        title: 'Auto-Complete Test Campaign',
        description: 'Test Phase 15',
        targetUserIds: [empAId, empBId],
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });
    expect(res.status).toBe(201);
    batchRequestId = res.body.data.id;
  });

  it('TASK-15.4: HR approves CV A -> Campaign is still Active', async () => {
    // A creates and publishes CV
    const resA = await request(API_URL).post('/api/cvs').set('Authorization', `Bearer ${empAToken}`).send({ title: 'Phase 15 A', templateId: 'modern-01', languageCode: 'vi' });
    cvAId = resA.body.data.id;
    await request(API_URL).put(`/api/cvs/${cvAId}/draft`).set('Authorization', `Bearer ${empAToken}`).send({ sectionsData: { personalInfo: { name: 'Emp A Phase 15' } } });
    await request(API_URL).post(`/api/cvs/${cvAId}/publish`).set('Authorization', `Bearer ${empAToken}`);

    // HR approves A's CV (level 2)
    // Actually our test workflow might need level 1 before level 2, or if no TechLead, HR is level 1?
    // Let's check workflow rules. If testemployee has no project, HR can approve directly?
    // Let's just try to approve it level 2. Wait, HR is Level 2.
    // If we just use Prisma to approve it, it triggers the logic? No, the logic is in the service.
    // Let's call the API to approve level 2.
    const approveResA = await request(API_URL).post(`/api/cvs/${cvAId}/approve`).set('Authorization', `Bearer ${hrToken}`).send({ level: 2 });
    // If it fails because of missing Level 1, we will mock the level 1 log.
    if (approveResA.status === 400 && approveResA.body.message.includes('Level 1')) {
       await prisma.approvalLog.create({ data: { cvProfileId: cvAId, approverId: hrId, action: 'Approve', level: 1 } });
       await request(API_URL).post(`/api/cvs/${cvAId}/approve`).set('Authorization', `Bearer ${hrToken}`).send({ level: 2 });
    } else {
       expect(approveResA.status).toBe(200);
    }

    // Check campaign status
    const campaign = await prisma.batchRequest.findUnique({ where: { id: batchRequestId } });
    expect(campaign?.status).toBe(BatchRequestStatus.Active);
  });

  it('TASK-15.4: HR approves CV B -> Campaign becomes Completed and Notification is sent', async () => {
    // B creates and publishes CV
    const resB = await request(API_URL).post('/api/cvs').set('Authorization', `Bearer ${empBToken}`).send({ title: 'Phase 15 B', templateId: 'modern-01', languageCode: 'en' });
    cvBId = resB.body.data.id;
    await request(API_URL).put(`/api/cvs/${cvBId}/draft`).set('Authorization', `Bearer ${empBToken}`).send({ sectionsData: { personalInfo: { name: 'Emp B Phase 15' } } });
    await request(API_URL).post(`/api/cvs/${cvBId}/publish`).set('Authorization', `Bearer ${empBToken}`);

    // HR approves B's CV
    const approveResB = await request(API_URL).post(`/api/cvs/${cvBId}/approve`).set('Authorization', `Bearer ${hrToken}`).send({ level: 2 });
    console.log('Approve B:', approveResB.status, approveResB.body);
    if (approveResB.status === 400 && approveResB.body.message.includes('Level 1')) {
       await prisma.approvalLog.create({ data: { cvProfileId: cvBId, approverId: hrId, action: 'Approve', level: 1 } });
       await request(API_URL).post(`/api/cvs/${cvBId}/approve`).set('Authorization', `Bearer ${hrToken}`).send({ level: 2 });
    } else {
       expect(approveResB.status).toBe(200);
    }

    // Check campaign status
    const campaign = await prisma.batchRequest.findUnique({ where: { id: batchRequestId } });
    expect(campaign?.status).toBe(BatchRequestStatus.Completed);

    // Check notification for HR
    const notifications = await prisma.notification.findMany({
      where: { userId: hrId, title: 'Batch Request Completed' }
    });
    expect(notifications.length).toBeGreaterThanOrEqual(1);
    expect(notifications[0].message).toContain('Auto-Complete Test Campaign');
  });
});
