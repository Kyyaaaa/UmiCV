import request from 'supertest';

const API_URL = 'http://localhost:3000';

describe('QA Phase 6 - Error Messaging & Inline Validation Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    // Get Admin Token for testing
    const adminLogin = await request(API_URL)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    
    if (adminLogin.status !== 200) {
      const adminLoginFallback = await request(API_URL)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });
      adminToken = adminLoginFallback.body?.data?.accessToken;
    } else {
      adminToken = adminLogin.body?.data?.accessToken;
    }
  });

  it('TASK-6.6: should return ZodError mapped properly for Inline Validation', async () => {
    // Intentionally sending invalid email
    const res = await request(API_URL)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'test_inline_val',
        password: '123', // too short
        fullName: 'Test User',
        email: 'invalid-email-format',
        role: 'Employee'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    console.log("TASK 6.6 BODY:", JSON.stringify(res.body, null, 2));
    // The top level message should extract the first error
    expect(res.body.message).toMatch(/^Lỗi tại trường/);
    
    // The errors array must be present for inline validation
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
    
    // Check if email error is mapped
    const emailError = res.body.errors.find((e: any) => e.field === 'email');
    expect(emailError).toBeDefined();
    
    // Check if password error is mapped
    const pwdError = res.body.errors.find((e: any) => e.field === 'password');
    expect(pwdError).toBeDefined();
  });

  it('TASK-6.7: should return specific Business Error with ID included', async () => {
    // Find an existing project or just use a dummy id
    const dummyProjectId = '00000000-0000-0000-0000-000000000000';
    const fakeUserId = '11111111-1111-1111-1111-111111111111';

    // Trying to assign a non-existent user to a dummy project
    // Even if project doesn't exist, we might get Project Not Found first.
    // Let's create a real project first just for this test
      const dummyProjectReq = await request(API_URL)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `TEST-QA6-${Date.now()}`,
        name: 'QA Phase 6 Test Project',
        description: 'Testing Business Errors',
        techLeadId: '11111111-1111-1111-1111-111111111111' // Valid UUID format to pass Zod
      });
      
    // Expected to fail with Tech Lead ID in the message
    expect(dummyProjectReq.status).toBe(400);
    expect(dummyProjectReq.body.message).toMatch(/\(ID: 11111111-1111-1111-1111-111111111111\)/);
  });
});
