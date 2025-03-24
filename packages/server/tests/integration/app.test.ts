import request from 'supertest';
import { app } from '@/index';

describe('应用集成测试', () => {
  test('健康检查端点返回200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  test('不存在的路由返回404', async () => {
    const response = await request(app).get('/not-exist-path');
    expect(response.status).toBe(404);
  });
}); 