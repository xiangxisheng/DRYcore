# 单元测试

## 概述

单元测试是测试单个代码单元（通常是函数或方法）的行为，确保其在隔离环境中按预期工作。DRYcore使用Jest作为主要的单元测试框架，结合TypeScript提供类型安全的测试环境。

## 单元测试目录结构

DRYcore的单元测试位于每个包的`tests/unit`目录中：

```
packages/server/
└── tests/
    └── unit/           # 单元测试
        ├── config/     # 配置模块测试
        ├── services/   # 服务层测试
        ├── utils/      # 工具函数测试
        └── ...
```

## 设置单元测试

### 1. 依赖安装

确保已安装以下依赖：

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "@types/jest": "^29.5.12",
    "@testing-library/react": "^14.0.0",    // 对于React组件
    "@testing-library/react-hooks": "^8.0.1" // 对于React Hooks
  }
}
```

### 2. Jest配置

确保Jest已正确配置（`jest.config.js`）：

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    // 其他别名...
  },
  // 单元测试特定配置
  testMatch: ['**/tests/unit/**/*.test.ts']
};
```

## 编写单元测试

### 1. 测试工具函数

```typescript
// tests/unit/utils/string.test.ts
import { capitalizeFirstLetter, truncate } from '@/utils/string';

describe('String Utilities', () => {
  describe('capitalizeFirstLetter', () => {
    test('应该将首字母大写', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    test('应该处理空字符串', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    test('应该保持已经大写的字母不变', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });
  });

  describe('truncate', () => {
    test('应该截断超过指定长度的字符串', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...');
    });

    test('应该保持不超过指定长度的字符串不变', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
      expect(truncate('Hi', 5)).toBe('Hi');
    });

    test('应该使用自定义后缀', () => {
      expect(truncate('Hello world', 5, '...')).toBe('Hello...');
      expect(truncate('Hello world', 5, '!')).toBe('Hello!');
    });
  });
});
```

### 2. 测试服务层

```typescript
// tests/unit/services/user.service.test.ts
import { UserService } from '@/services/user.service';
import { prisma } from '@/lib/prisma';

// 模拟Prisma客户端
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    test('应该通过ID查找用户', async () => {
      const mockUser = { id: 1, name: '测试用户', email: 'test@example.com' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.findById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    test('用户不存在时应该返回null', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await UserService.findById(999);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('应该创建新用户', async () => {
      const userData = { name: '新用户', email: 'new@example.com', password: 'password' };
      const createdUser = { id: 1, ...userData, createdAt: new Date(), updatedAt: new Date() };
      
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await UserService.create(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(createdUser);
    });
  });

  // 其他测试用例...
});
```

### 3. 测试配置加载

```typescript
// tests/unit/config/env.test.ts
import { env } from '@/config/env';

describe('环境配置', () => {
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

  test('应该提供默认值', () => {
    // 确保关键配置有默认值
    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeDefined();
    expect(env.HOST).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
  });

  test('环境帮助函数应该工作正常', () => {
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
  });
});
```

## 测试React组件

对于前端代码，我们使用`@testing-library/react`进行组件测试：

```tsx
// packages/web/tests/unit/components/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button组件', () => {
  test('应该渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  test('点击时应该调用onClick处理函数', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    fireEvent.click(screen.getByText('点击我'));
    
    expect(handleClick).toHaveBeenCalled();
  });

  test('禁用时应该不可点击', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>点击我</Button>);
    
    const button = screen.getByText('点击我');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('应该应用自定义className', () => {
    render(<Button className="custom-button">点击我</Button>);
    
    const button = screen.getByText('点击我');
    expect(button).toHaveClass('custom-button');
  });
});
```

## 测试React Hooks

使用`@testing-library/react-hooks`测试自定义Hooks：

```tsx
// packages/web/tests/unit/hooks/useCounter.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from '@/hooks/useCounter';

describe('useCounter Hook', () => {
  test('应该使用初始值', () => {
    const { result } = renderHook(() => useCounter(5));
    
    expect(result.current.count).toBe(5);
  });

  test('increment应该增加计数器', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  test('decrement应该减少计数器', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  test('reset应该重置计数器', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });
});
```

## 测试Redux逻辑

```tsx
// packages/web/tests/unit/redux/auth.test.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout, selectUser } from '@/redux/auth';

describe('Auth Slice', () => {
  test('应该处理初始状态', () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    const state = store.getState();
    
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBeNull();
  });

  test('应该处理登录成功', () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    const user = { id: 1, name: '测试用户' };
    
    store.dispatch(login.fulfilled(user, '', { email: 'test@example.com', password: 'password' }));
    
    const state = store.getState();
    expect(state.auth.user).toEqual(user);
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBeNull();
  });

  test('应该处理登录失败', () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    const error = { message: '无效的凭据' };
    
    store.dispatch(login.rejected(new Error('无效的凭据'), '', { email: 'wrong@example.com', password: 'wrong' }));
    
    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBeTruthy();
  });

  test('应该处理登出', () => {
    const store = configureStore({ 
      reducer: { auth: authReducer },
      preloadedState: { 
        auth: { 
          user: { id: 1, name: '测试用户' }, 
          isAuthenticated: true, 
          loading: false, 
          error: null 
        } 
      }
    });
    
    store.dispatch(logout());
    
    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  test('选择器应该返回用户', () => {
    const user = { id: 1, name: '测试用户' };
    const state = { auth: { user, isAuthenticated: true, loading: false, error: null } };
    
    expect(selectUser(state)).toEqual(user);
  });
});
```

## 模拟技术

### 1. 函数模拟(Mocks)

```typescript
// 模拟外部服务
jest.mock('@/services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

// 在测试中使用
import { sendEmail } from '@/services/email';

test('应该发送邮件', async () => {
  await sendWelcomeEmail('user@example.com', 'User');
  expect(sendEmail).toHaveBeenCalledWith(
    'user@example.com',
    '欢迎加入',
    expect.any(String)
  );
});
```

### 2. 时间模拟

```typescript
// 模拟日期
const mockDate = new Date('2023-01-01T00:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

test('应该使用当前时间创建记录', () => {
  const record = createRecord({ name: 'Test' });
  expect(record.createdAt).toEqual(mockDate);
});
```

### 3. 环境变量模拟

```typescript
// 模拟环境变量
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  process.env.API_KEY = 'test-api-key';
});

afterAll(() => {
  process.env = originalEnv;
});

test('应该使用环境变量中的API密钥', () => {
  const config = require('@/config').default;
  expect(config.apiKey).toBe('test-api-key');
});
```

## 测试覆盖率

DRYcore 要求单元测试覆盖率达到至少80%：

```bash
# 运行测试并生成覆盖率报告
pnpm test:coverage
```

Jest会生成HTML覆盖率报告在`coverage/`目录中，你可以在浏览器中查看详细的覆盖率信息。

## 单元测试最佳实践

1. **测试一个单元** - 每个测试应该专注于单一函数或方法
2. **使用模拟隔离依赖** - 隔离外部依赖，确保测试的纯粹性
3. **测试公共接口** - 测试面向用户的公共API，而非内部实现细节
4. **描述性测试名称** - 使用清晰描述性的测试名称，格式如："应该当<条件>时<期望结果>"
5. **准备、执行、断言模式** - 遵循经典的测试模式组织测试代码
6. **避免测试实现细节** - 关注行为而非实现
7. **使用factory函数** - 创建测试数据的工厂函数使测试更清晰

## 实例：完整的用户服务测试

```typescript
// tests/unit/services/user.service.test.ts
import { UserService } from '@/services/user.service';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/utils/auth';
import { EmailService } from '@/services/email.service';

// 模拟依赖
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/utils/auth', () => ({
  hashPassword: jest.fn(pwd => `hashed_${pwd}`),
}));

jest.mock('@/services/email.service', () => ({
  EmailService: {
    sendWelcomeEmail: jest.fn(),
  },
}));

// 测试辅助函数：用户工厂
const userFactory = (override = {}) => ({
  id: 1,
  name: '测试用户',
  email: 'test@example.com',
  password: 'hashed_password',
  role: 'USER',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...override,
});

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    test('应该通过ID查找用户', async () => {
      const mockUser = userFactory();
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.findById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    test('用户不存在时应该返回null', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await UserService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('应该哈希密码并创建用户', async () => {
      const userData = { name: '新用户', email: 'new@example.com', password: 'password', role: 'USER' };
      const createdUser = userFactory({
        name: '新用户',
        email: 'new@example.com',
      });
      
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await UserService.create(userData);

      expect(hashPassword).toHaveBeenCalledWith('password');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: 'hashed_password',
        },
      });
      expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith('new@example.com', '新用户');
      expect(result).toEqual(createdUser);
    });

    test('创建失败时应该抛出错误', async () => {
      const userData = { name: '新用户', email: 'new@example.com', password: 'password', role: 'USER' };
      const error = new Error('数据库错误');
      
      prisma.user.create.mockRejectedValue(error);

      await expect(UserService.create(userData)).rejects.toThrow('数据库错误');
      expect(EmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  // 更多测试用例...
});
```

## 小结

单元测试是DRYcore测试策略的基础，确保每个独立组件按预期工作。通过遵循这些最佳实践，你可以创建可靠、可维护的测试套件，为项目提供强大的质量保障。 