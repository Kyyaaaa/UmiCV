import request from 'supertest';
import prisma from '../config/db';
import { CVStatus } from '@prisma/client';

const API_URL = 'http://localhost:3000';

describe('QA Phase 18 - CV Search & Filter API', () => {
  let adminToken = '';
  let empToken = '';
  let mockCvId1 = '';
  let mockCvId2 = '';

  beforeAll(async () => {
    // Authenticate Admin
    const adminLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;

    // Create some mock CVs with specific submittedAt times to test SLA
    const empMe = await prisma.user.findFirst({ where: { username: 'testemployee' }});
    const empId = empMe!.id;

    const now = new Date();
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000); // Warning
    const fiftyHoursAgo = new Date(now.getTime() - 50 * 60 * 60 * 1000);  // Overdue

    await prisma.cVProfile.deleteMany({ where: { userId: empId } });

    const cv1 = await prisma.cVProfile.create({
      data: {
        userId: empId,
        languageCode: 'vi',
        status: CVStatus.PendingApproval,
        submittedAt: thirtyHoursAgo,
        versionNumber: 1,
        sectionsData: { personalInfo: { name: 'SLA Warning CV' } }
      }
    });
    mockCvId1 = cv1.id;

    const cv2 = await prisma.cVProfile.create({
      data: {
        userId: empId,
        languageCode: 'en',
        status: CVStatus.PendingApproval,
        submittedAt: fiftyHoursAgo,
        versionNumber: 1,
        sectionsData: { personalInfo: { name: 'SLA Overdue CV' } }
      }
    });
    mockCvId2 = cv2.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.cVProfile.deleteMany({
      where: { id: { in: [mockCvId1, mockCvId2] } }
    });
  });

  it('should filter by keyword successfully', async () => {
    // 'testemployee' should match the username field
    const res = await request(API_URL)
      .get('/api/cvs/search?keyword=testemployee')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Ensure all returned CVs belong to a user whose username contains 'testemployee' 
    // or has matching skills in JSON
  });

  it('should filter by slaStatus=Warning successfully', async () => {
    const res = await request(API_URL)
      .get('/api/cvs/search?slaStatus=Warning')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    const cvs = res.body.data;
    const hasMock1 = cvs.some((c: any) => c.id === mockCvId1);
    const hasMock2 = cvs.some((c: any) => c.id === mockCvId2);
    
    expect(hasMock1).toBe(true); // Should be in warning
    expect(hasMock2).toBe(false); // Should NOT be in warning (it is overdue)
  });

  it('should filter by slaStatus=Overdue successfully', async () => {
    const res = await request(API_URL)
      .get('/api/cvs/search?slaStatus=Overdue')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    const cvs = res.body.data;
    const hasMock1 = cvs.some((c: any) => c.id === mockCvId1);
    const hasMock2 = cvs.some((c: any) => c.id === mockCvId2);
    
    expect(hasMock1).toBe(false); 
    expect(hasMock2).toBe(true); // Should be in overdue
  });
});
