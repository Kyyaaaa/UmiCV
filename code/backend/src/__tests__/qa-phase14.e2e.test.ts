import request from 'supertest';
import prisma from '../config/db';
import { checkSLA } from '../modules/workflow/workflow.cron';
import { CVStatus } from '@prisma/client';

const API_URL = 'http://localhost:3000';

describe('QA Phase 14 - SLA Enforcement Tests', () => {
  let employeeToken = '';
  let employeeId = '';
  let techLeadId = '';
  let techLeadToken = '';
  let cvWarningId = '';
  let cvOverdueId = '';

  beforeAll(async () => {
    // 1. Tạo hoặc lấy mock data
    // Dùng admin để dọn dẹp hoặc khởi tạo
    const empLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testemployee', password: 'password123' });
    employeeToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;

    const meRes = await request(API_URL).get('/api/users/me').set('Authorization', `Bearer ${employeeToken}`);
    employeeId = meRes.body.data.id;

    // Lấy ai đó làm TechLead (nếu có user "techlead", không thì dùng admin làm mock techlead)
    let tlUser = await prisma.user.findFirst({ where: { username: 'testtechlead' } });
    if (!tlUser) {
      tlUser = await prisma.user.findFirst({ where: { username: 'admin' } });
    }
    techLeadId = tlUser!.id;

    // Xóa tất cả các thông báo của TechLead để dễ kiểm tra
    await prisma.notification.deleteMany({
      where: { userId: techLeadId }
    });

    // Tạo tạm 1 Project để gán tech lead cho testemployee
    const proj = await prisma.project.create({
      data: {
        code: 'SLA-TEST',
        name: 'SLA Test Project',
        techLeadId: techLeadId,
      }
    });

    await prisma.projectMember.create({
      data: {
        projectId: proj.id,
        userId: employeeId,
      }
    });

    // Xóa CV cũ để tránh lỗi unique constraint language
    await prisma.cVProfile.deleteMany({
      where: { userId: employeeId }
    });

    // 2. Tạo 2 CV
    const cv1Res = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ title: 'CV Warning', templateId: 'modern-01', languageCode: 'vi' });

    // Publish nó
    if (cv1Res.body.data) {
      cvWarningId = cv1Res.body.data.id;
      await request(API_URL).put(`/api/cvs/${cvWarningId}/draft`).set('Authorization', `Bearer ${employeeToken}`).send({ sectionsData: { personalInfo: { name: 'Test 1' } } });
      const p1 = await request(API_URL).post(`/api/cvs/${cvWarningId}/publish`).set('Authorization', `Bearer ${employeeToken}`);
      console.log('Publish 1:', p1.body);
    }

    const cv2Res = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ title: 'CV Overdue', templateId: 'modern-01', languageCode: 'en' });

    if (cv2Res.body.data) {
      cvOverdueId = cv2Res.body.data.id;
      await request(API_URL).put(`/api/cvs/${cvOverdueId}/draft`).set('Authorization', `Bearer ${employeeToken}`).send({ sectionsData: { personalInfo: { name: 'Test 2' } } });
      const p2 = await request(API_URL).post(`/api/cvs/${cvOverdueId}/publish`).set('Authorization', `Bearer ${employeeToken}`);
      console.log('Publish 2:', p2.body);
    }

    // 3. Mock thời gian lùi lại
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000);
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);

    if (cvWarningId) {
      await prisma.cVProfile.update({
        where: { id: cvWarningId },
        data: { submittedAt: thirtyHoursAgo }
      });
    }

    if (cvOverdueId) {
      await prisma.cVProfile.update({
        where: { id: cvOverdueId },
        data: { submittedAt: fiftyHoursAgo }
      });
    }
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu
    await prisma.projectMember.deleteMany({ where: { userId: employeeId } });
    await prisma.project.deleteMany({ where: { name: 'SLA Test Project' } });
    if (cvWarningId) await prisma.cVProfile.delete({ where: { id: cvWarningId } });
    if (cvOverdueId) await prisma.cVProfile.delete({ where: { id: cvOverdueId } });
  });

  it('TASK-14.4: SLA Scanner should send correct Warning and Overdue notifications to TechLead', async () => {
    // Gọi hàm quét SLA bằng tay
    await checkSLA();

    // Check DB manually
    const pending = await prisma.cVProfile.findMany({
      where: { status: CVStatus.PendingApproval },
      select: { id: true, submittedAt: true, status: true, userId: true }
    });
    console.log('Pending CVs in DB:', pending);
    console.log('TechLead ID:', techLeadId);
    console.log('Employee ID:', employeeId);

    // Kiểm tra thông báo của TechLead
    const notifications = await prisma.notification.findMany({
      where: { userId: techLeadId, title: { contains: 'SLA' } },
      orderBy: { createdAt: 'desc' }
    });

    // Phải có 2 thông báo: 1 Warning, 1 Overdue
    const hasWarning = notifications.some(n => n.title.includes('Warning') && n.message.includes('30 hours'));
    const hasOverdue = notifications.some(n => n.title.includes('Overdue') && n.message.includes('50 hours'));

    expect(notifications.length).toBeGreaterThanOrEqual(2);
    expect(hasWarning).toBe(true);
    expect(hasOverdue).toBe(true);
  });
});
