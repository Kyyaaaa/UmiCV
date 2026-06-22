import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

const API_URL = app;

describe('QA Phase 26 - Pagination Testing', () => {
  let adminToken = '';
  let projectId = '';
  let batchId = '';
  const testUser = 'phase26_qa_user';
  let adminId = '';

  beforeAll(async () => {
    // 1. Get Admin Token
    const adminLoginRes = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLoginRes.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123123123@As' })).body?.data?.accessToken;
    adminId = adminLoginRes.body?.data?.id || (await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${adminToken}`)).body?.data?.id;

    // Clean up
    await prisma.batchRequestTarget.deleteMany({ where: { batchRequest: { title: 'QA Phase 26 Batch' } } });
    await prisma.batchRequest.deleteMany({ where: { title: 'QA Phase 26 Batch' } });
    await prisma.projectMember.deleteMany({ where: { project: { code: 'QA26' } } });
    await prisma.project.deleteMany({ where: { code: 'QA26' } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa26_user' } } });

    // 2. Setup Data
    const dept = await prisma.department.findFirst();
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123123123@As', 10);
    
    // Create 5 users
    const userIds = [];
    for(let i=1; i<=5; i++) {
        const u = await prisma.user.create({
            data: {
                username: `qa26_user_${i}`,
                email: `qa26_${i}@example.com`,
                fullName: `QA User ${i}`,
                passwordHash: hash,
                role: 'Employee',
                departmentId: dept?.id || ''
            }
        });
        userIds.push(u.id);
    }

    // Create a Project and add 5 members
    const proj = await prisma.project.create({
        data: {
            code: 'QA26',
            name: 'QA Pagination Project',
            techLeadId: adminId
        }
    });
    projectId = proj.id;
    
    await prisma.projectMember.createMany({
        data: userIds.map(uid => ({ projectId: proj.id, userId: uid }))
    });

    // Create a Batch Request and add 5 targets
    const batch = await prisma.batchRequest.create({
        data: {
            title: 'QA Phase 26 Batch',
            deadline: new Date(Date.now() + 86400000),
            status: 'Active',
            createdBy: adminId
        }
    });
    batchId = batch.id;

    await prisma.batchRequestTarget.createMany({
        data: userIds.map(uid => ({ batchRequestId: batch.id, userId: uid }))
    });
  });

  afterAll(async () => {
    await prisma.batchRequestTarget.deleteMany({ where: { batchRequestId: batchId } });
    await prisma.batchRequest.delete({ where: { id: batchId } });
    await prisma.projectMember.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa26_user' } } });
  });

  it('should paginate Project Members with limit=2', async () => {
    const res = await request(API_URL)
      .get(`/api/projects/${projectId}/members?page=1&limit=2`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.total).toBe(5);
    expect(res.body.data.length).toBe(2);

    const resPage2 = await request(API_URL)
      .get(`/api/projects/${projectId}/members?page=2&limit=2`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(resPage2.body.page).toBe(2);
    expect(resPage2.body.data.length).toBe(2);
    // Ensure no duplicates
    expect(resPage2.body.data[0].userId).not.toBe(res.body.data[0].userId);
  });

  it('should paginate Batch Request Targets with limit=2', async () => {
    const res = await request(API_URL)
      .get(`/api/batch-requests/${batchId}/targets?page=1&limit=2`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.total).toBe(5);
    expect(res.body.data.length).toBe(2);

    const resPage3 = await request(API_URL)
      .get(`/api/batch-requests/${batchId}/targets?page=3&limit=2`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(resPage3.body.page).toBe(3);
    expect(resPage3.body.data.length).toBe(1); // Since total is 5, page 3 limit 2 should have 1 item
  });

  it('should paginate CV Versions with limit=2', async () => {
    // 1. Create a CV
    const createRes = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ languageCode: 'vi' });
    
    expect(createRes.status).toBe(201);
    const cvId = createRes.body.data.id;

    // 2. Create multiple versions by updating and publishing
    for (let i = 1; i <= 5; i++) {
      // Update draft
      await request(API_URL)
        .put(`/api/cvs/${cvId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: `Draft ${i}` });
      
      // Since creating a history directly is complex through API (requires approval process),
      // we'll just insert directly into DB for testing pagination
      await prisma.cVVersionHistory.create({
        data: {
            cvProfileId: cvId,
            versionNumber: i,
            snapshotData: { title: `Draft ${i}` }
        }
      });
    }

    // 3. Test pagination
    const res = await request(API_URL)
      .get(`/api/cvs/${cvId}/versions?page=1&limit=2`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.total).toBe(5);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].versionNumber).toBe(5); // Ordered by desc

    // Clean up
    await prisma.cVVersionHistory.deleteMany({ where: { cvProfileId: cvId } });
    await prisma.cVProfile.delete({ where: { id: cvId } });
  });
});
