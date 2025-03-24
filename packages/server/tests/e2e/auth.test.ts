import request from 'supertest';
import { app } from '@/index';

describe('认证端到端测试', () => {
  let authToken: string;

  beforeAll(async () => {
    // 测试前清理数据库
    // TODO: 实现数据库清理逻辑
  });

  test('用户注册', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        name: '测试用户'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('用户登录', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    
    // 保存token用于后续测试
    authToken = response.body.token;
  });

  test('获取当前用户信息', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  afterAll(async () => {
    // 测试后清理数据库
    // TODO: 实现数据库清理逻辑
  });
}); 