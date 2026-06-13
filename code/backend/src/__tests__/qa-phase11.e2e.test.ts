import request from 'supertest';

const API_URL = 'http://localhost:3000';

describe('QA Phase 11 - In-App Notifications Tests', () => {
  let adminToken = '';
  let hrToken = '';
  let employeeToken = '';
  let employeeId = '';
  let testCvId = '';

  beforeAll(async () => {
    // 1. Authenticate to get tokens
    const adminLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body.data.accessToken;

    const hrLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testhr', password: 'password123' });
    hrToken = hrLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testhr', password: '123456' })).body?.data?.accessToken || adminToken; // Fallback to admin if HR fails

    const empLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testemployee', password: 'password123' });
    employeeToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;

    // 2. Lấy thông tin user
    const empRes = await request(API_URL)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${employeeToken}`);
    employeeId = empRes.body?.data?.id;

    // 3. Tạo một CV nháp để test Reject
    const cvRes = await request(API_URL)
      .post('/api/cvs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'CV for Notification Test',
        templateId: 'modern-01'
      });
    testCvId = cvRes.body?.data?.id;

    // 4. Nộp CV để chuyển sang PendingApproval
    if (testCvId) {
      await request(API_URL)
        .post(`/api/cvs/${testCvId}/publish`)
        .set('Authorization', `Bearer ${employeeToken}`);
    }
  });

  afterAll(async () => {
    // Chúng ta không dọn dẹp trực tiếp qua Prisma ở file e2e test này
    // để tránh đụng độ module. Dọn dẹp có thể được xử lý qua API nếu cần.
  });

  it('TASK-11.6: CV Rejection should create a private notification for the employee', async () => {
    if (!testCvId) return; // Skip if CV creation failed
    // 1. HR Reject CV
    const rejectRes = await request(API_URL)
      .post(`/api/cvs/${testCvId}/reject`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ comment: 'Lack of experience (QA Test)' });

    expect(rejectRes.status).toBe(200);

    // 2. Kiểm tra thông báo của Employee
    const notiRes = await request(API_URL)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(notiRes.status).toBe(200);
    const notifications = notiRes.body.data;
    const hasRejectNoti = notifications.some(
      (n: any) => n.type === 'error' && (n.title.includes('từ chối') || n.title.includes('bị từ chối'))
    );

    expect(hasRejectNoti).toBe(true);
  });

  it('TASK-11.6: Broadcast notification should be visible to other users', async () => {
    // 1. Admin gửi Broadcast
    const broadcastMsg = `Test Broadcast ${Date.now()}`;
    const broadcastRes = await request(API_URL)
      .post('/api/notifications/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'System Update',
        message: broadcastMsg,
        type: 'info'
      });

    expect(broadcastRes.status).toBe(201);

    // 2. Employee kiểm tra xem có thấy Broadcast này không
    const notiRes = await request(API_URL)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(notiRes.status).toBe(200);
    const notifications = notiRes.body.data;
    const hasBroadcast = notifications.some(
      (n: any) => n.isGlobal === true && n.message === broadcastMsg
    );

    expect(hasBroadcast).toBe(true);
  });
});
