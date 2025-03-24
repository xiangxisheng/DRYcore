// 这是Jest测试前的设置脚本

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://root:password@localhost:3306/drycore_test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-secret-key';

// 添加自定义断言
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
}); 