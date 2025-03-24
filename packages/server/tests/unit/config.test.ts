import { env } from '@config/env';

describe('环境配置测试', () => {
  // 备份原始环境变量
  const originalEnv = process.env;

  beforeEach(() => {
    // 重置环境变量
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // 恢复原始环境变量
    process.env = originalEnv;
  });

  test('环境配置有默认值', () => {
    // 确保关键配置有默认值
    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeDefined();
    expect(env.HOST).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
  });

  test('环境帮助函数工作正常', () => {
    // 测试开发环境
    process.env.NODE_ENV = 'development';
    expect(env.isDev()).toBe(true);
    expect(env.isProd()).toBe(false);
    expect(env.isTest()).toBe(false);

    // 测试生产环境
    process.env.NODE_ENV = 'production';
    expect(env.isDev()).toBe(false);
    expect(env.isProd()).toBe(true);
    expect(env.isTest()).toBe(false);

    // 测试测试环境
    process.env.NODE_ENV = 'test';
    expect(env.isDev()).toBe(false);
    expect(env.isProd()).toBe(false);
    expect(env.isTest()).toBe(true);
  });
}); 