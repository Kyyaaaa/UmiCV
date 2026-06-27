import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

const API_URL = app;

describe('QA Phase 31 - HR Role on Projects', () => {
  let hrToken = '';
  let employeeId = '';
  let projectId = '';

  beforeAll(async () => {
    // 1. Clean up
    await prisma.projectMember.deleteMany({ where: { user: { username: { startsWith: 'qa31' } } } });
    await prisma.project.deleteMany({ where: { name: { startsWith: 'QA 31' } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa31' } } });

    // 2. Setup Data
    const dept = await prisma.department.findFirst();
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('123123123@As', 10);

    // Create HR User
    const hr = await prisma.user.create({
        data: {
            username: 'qa31_hr',
            email: 'qa31_hr@example.com',
            fullName: 'QA31 HR',
            passwordHash: hash,
            role: 'HR',
            departmentId: dept?.id || ''
        }
    });

    // Create TechLead User
    const techlead = await prisma.user.create({
        data: {
            username: 'qa31_techlead',
            email: 'qa31_techlead@example.com',
            fullName: 'QA31 TechLead',
            passwordHash: hash,
            role: 'TechLead',
            departmentId: dept?.id || ''
        }
    });

    // Create Employee User
    const emp = await prisma.user.create({
        data: {
            username: 'qa31_emp',
            email: 'qa31_emp@example.com',
            fullName: 'QA31 Employee',
            passwordHash: hash,
            role: 'Employee',
            departmentId: dept?.id || ''
        }
    });
    employeeId = emp.id;

    // Admin creates a project
    const adminLoginRes = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123123123@As' });
    let adminToken = adminLoginRes.body?.data?.accessToken;
    if (!adminToken) {
        const adminFallback = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
        adminToken = adminFallback.body?.data?.accessToken;
    }

    const projectRes = await request(API_URL)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            name: 'QA 31 Project',
            code: 'QA31PROJ',
            techLeadId: techlead.id
        });
    projectId = projectRes.body.data.id;

    // Login as HR
    const hrLoginRes = await request(API_URL).post('/api/auth/login').send({ username: 'qa31_hr', password: '123123123@As' });
    hrToken = hrLoginRes.body?.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.projectMember.deleteMany({ where: { user: { username: { startsWith: 'qa31' } } } });
    await prisma.project.deleteMany({ where: { name: { startsWith: 'QA 31' } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'qa31' } } });
  });

  it('1. HR cannot create project (403 Forbidden)', async () => {
    const res = await request(API_URL)
      .post('/api/projects')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        name: 'QA 31 Another Project',
        code: 'QA31ANO',
        techLeadId: employeeId // Invalid anyway, but should fail authorization first
      });
    
    expect(res.status).toBe(403);
  });

  it('2. HR cannot delete project (403 Forbidden)', async () => {
    const res = await request(API_URL)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${hrToken}`);
    
    expect(res.status).toBe(403);
  });

  it('3. HR can add member to project (200 OK)', async () => {
    const res = await request(API_URL)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        userIds: [employeeId]
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('4. HR can view projects and members (200 OK)', async () => {
    const resProjects = await request(API_URL)
      .get('/api/projects')
      .set('Authorization', `Bearer ${hrToken}`);
    expect(resProjects.status).toBe(200);

    const resMembers = await request(API_URL)
      .get(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${hrToken}`);
    expect(resMembers.status).toBe(200);
    expect(resMembers.body.data.length).toBeGreaterThan(0);
  });
});
