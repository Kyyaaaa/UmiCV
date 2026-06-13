import request from 'supertest';
import prisma from '../config/db';

const API_URL = 'http://localhost:3000';

describe('QA Phase 12 - Latest Approved CV Tests', () => {
  let employeeToken = '';
  let hrToken = '';
  let adminToken = '';
  let testCvId = '';

  beforeAll(async () => {
    // 1. Authenticate to get tokens
    const empLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testemployee', password: 'password123' });
    employeeToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;

    const adminLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body?.data?.accessToken;

    const hrLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testhr', password: 'password123' });
    hrToken = hrLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testhr', password: '123456' })).body?.data?.accessToken || adminToken;

    // Lấy danh sách CV của testemployee và xóa để đảm bảo không bị lỗi 400 do trùng ngôn ngữ
    const empCvs = await request(API_URL)
      .get('/api/cvs/me')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    if (empCvs.body?.data?.length > 0) {
      for (const cv of empCvs.body.data) {
        // Mock API xóa CV (hoặc dùng Prisma nếu cần thiết, ở đây ta gọi qua API nếu có)
        // Nếu API không có, ta gọi trực tiếp Prisma db
      }
    }
    
    // An toàn nhất: Xóa CV cũ của testemployee bằng prisma
    const empUser = await prisma.user.findFirst({ where: { username: 'testemployee' } });
    if (empUser) {
      await prisma.cVProfile.deleteMany({ where: { userId: empUser.id } });
    }
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test (nếu cần thiết, tuy nhiên e2e trực tiếp nên cẩn thận)
    // Để giữ an toàn, chúng ta không gọi prisma trực tiếp ở đây vì dev server đang giữ connection
  });

  it('TASK-12.4: Should return the correct latest approved snapshot, ignoring draft edits', async () => {
    // 1. Employee: Tạo CV
    const createRes = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        languageCode: 'jp'
      });
    expect(createRes.status).toBe(201);
    testCvId = createRes.body.data.id;

    // Lấy cấu trúc cơ bản của CV
    const cvDetailRes = await request(API_URL)
      .get(`/api/cvs/${testCvId}`)
      .set('Authorization', `Bearer ${employeeToken}`);
    const baseSectionsData = cvDetailRes.body.data.sectionsData;

    // 2. Employee: Update draft (Add Skill A)
    const skillASectionsData = {
      ...baseSectionsData,
      skills: [{ name: 'Skill A' }]
    };
    await request(API_URL)
      .put(`/api/cvs/${testCvId}/draft`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ sectionsData: skillASectionsData });

    // 3. Employee: Nộp CV
    await request(API_URL)
      .post(`/api/cvs/${testCvId}/publish`)
      .set('Authorization', `Bearer ${employeeToken}`);

    // 4. Admin: Duyệt CV (Cấp 1 rồi Cấp 2 để ra version 1)
    await request(API_URL)
      .post(`/api/cvs/${testCvId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ level: 1 });

    const approveRes = await request(API_URL)
      .post(`/api/cvs/${testCvId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ level: 2 });
    expect(approveRes.status).toBe(200);

    // 5. Employee: Cập nhật bản nháp, thêm "Skill B"
    const skillABSectionsData = {
      ...baseSectionsData,
      skills: [{ name: 'Skill A' }, { name: 'Skill B' }]
    };
    const updateDraftRes2 = await request(API_URL)
      .put(`/api/cvs/${testCvId}/draft`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ sectionsData: skillABSectionsData });

    expect(updateDraftRes2.status).toBe(200);

    // 6. Kiểm tra bản nháp hiện tại (phải chứa cả Skill A và Skill B)
    const currentDetailRes = await request(API_URL)
      .get(`/api/cvs/${testCvId}`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(currentDetailRes.body.data.sectionsData.skills).toHaveLength(2);

    // 7. Gọi API lấy bản duyệt gần nhất
    const latestApprovedRes = await request(API_URL)
      .get(`/api/cvs/${testCvId}/latest-approved`)
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(latestApprovedRes.status).toBe(200);
    const approvedData = latestApprovedRes.body.data;
    
    // Đảm bảo API trả về đúng snapshotData có versionNumber >= 1
    expect(approvedData.versionNumber).toBeGreaterThanOrEqual(1);
    
    // Đảm bảo snapshotData chỉ chứa Skill A (phiên bản lúc được duyệt)
    expect(approvedData.snapshotData.skills).toHaveLength(1);
    expect(approvedData.snapshotData.skills[0].name).toBe('Skill A');
  });
});
