import request from 'supertest';
import prisma from '../config/db';

const API_URL = 'http://localhost:3000';

describe('QA Phase 9 - CV Structure & Mockup Sync Tests', () => {
  let userToken: string;
  let cvId: string;

  beforeAll(async () => {
    // 1. Get an Employee Token (or Admin)
    const login = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    
    if (login.status !== 200) {
      const loginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      userToken = loginFallback.body?.data?.accessToken;
    } else {
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
    // Clean up created CV
    if (cvId) {
      await prisma.cVProfile.delete({ where: { id: cvId } });
    }
    await prisma.$disconnect();
  });

  it('TASK-9.5: Backend should accept new CV fields (location, github, linkedin, svg icon)', async () => {
    const newStructurePayload = {
      sectionsData: {
        personalInfo: { 
          name: 'QA Tester',
          role: 'Quality Assurance',
          about: 'Testing phase 9',
          email: 'qa@umicv.local',
          phone: '+123456789',
          location: 'Ho Chi Minh',
          website: 'https://umicv.local',
          github: 'github.com/qa',
          linkedin: 'linkedin.com/in/qa'
        },
        skills: [{ 
          name: 'Test Automation'
        }],
        experience: [{
          company: 'UmiCV',
          title: 'QA Engineer',
          date: '2025 - Present',
          desc: 'Tested everything'
        }],
        education: [{
          institution: 'VNUHCM',
          date: '2020 - 2024',
          qualification: 'BSc Computer Science'
        }],
        projects: [{
          name: 'QuickCV Sync',
          link: 'https://github.com/umicv',
          desc: 'Synced the layout perfectly'
        }]
      }
    };

    const res = await request(API_URL)
      .put(`/api/cvs/${cvId}/draft`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(newStructurePayload);

    // It should succeed (200 OK)
    expect(res.status).toBe(200);

    // Verify saved data matches the new structure
    const savedData = res.body.data.sectionsData;
    expect(savedData.personalInfo.location).toBe('Ho Chi Minh');
    expect(savedData.personalInfo.github).toBe('github.com/qa');
    expect(savedData.personalInfo.linkedin).toBe('linkedin.com/in/qa');
    expect(savedData.experience[0].company).toBe('UmiCV');
    expect(savedData.education[0].institution).toBe('VNUHCM');
    expect(savedData.projects[0].link).toBe('https://github.com/umicv');
  });
});
