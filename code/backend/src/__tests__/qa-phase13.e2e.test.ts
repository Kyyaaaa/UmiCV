import request from 'supertest';
import prisma from '../config/db';

const API_URL = 'http://localhost:3000';

describe('QA Phase 13 - Red Dot Notification Badge', () => {
  let employeeToken = '';
  let adminToken = '';

  beforeAll(async () => {
    // 1. Authenticate to get tokens
    const empLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'testemployee', password: 'password123' });
    employeeToken = empLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'testemployee', password: '123456' })).body.data.accessToken;

    const adminLogin = await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body?.data?.accessToken || (await request(API_URL).post('/api/auth/login').send({ username: 'admin', password: '123456' })).body?.data?.accessToken;
  });

  it('TASK-13.6: check-new should reflect hasNew correctly when a broadcast is sent and marked as checked', async () => {
    // 1. Đánh dấu tất cả thông báo hiện tại là đã đọc trước để clear state
    await request(API_URL)
      .put('/api/notifications/mark-checked')
      .set('Authorization', `Bearer ${employeeToken}`);

    // 2. Gọi check-new, phải trả về hasNew: false
    const check1 = await request(API_URL)
      .get('/api/notifications/check-new')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(check1.status).toBe(200);
    expect(check1.body.data.hasNew).toBe(false);

    // 3. Admin gửi Broadcast
    const broadcastMsg = `Broadcast Red Dot ${Date.now()}`;
    const broadcastRes = await request(API_URL)
      .post('/api/notifications/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Red Dot Test',
        message: broadcastMsg,
        type: 'info'
      });
    expect(broadcastRes.status).toBe(201);

    // 4. Gọi check-new lại, phải trả về hasNew: true (tương ứng với việc hiển thị chấm đỏ)
    const check2 = await request(API_URL)
      .get('/api/notifications/check-new')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(check2.status).toBe(200);
    expect(check2.body.data.hasNew).toBe(true);

    // 5. Employee bấm vào chuông -> Gọi API mark-checked
    const markCheckedRes = await request(API_URL)
      .put('/api/notifications/mark-checked')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(markCheckedRes.status).toBe(200);

    // 6. Kiểm tra lại check-new -> Dấu đỏ biến mất (hasNew: false)
    const check3 = await request(API_URL)
      .get('/api/notifications/check-new')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(check3.status).toBe(200);
    expect(check3.body.data.hasNew).toBe(false);
  });
});
