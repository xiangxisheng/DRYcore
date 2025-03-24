# 认证API

## 概述

DRYcore 认证API提供了完整的用户认证和授权功能，包括用户注册、登录、权限控制等。该API设计为跨平台兼容，同时支持传统的基于会话的认证和现代的基于JWT的认证。

**稳定性：稳定**

## 安装与配置

### 安装

认证模块已内置在DRYcore核心包中，无需单独安装。

### 基本配置

在项目的`.env`文件中设置认证相关的配置：

```env
# JWT配置
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# 密码加密
PASSWORD_SALT_ROUNDS=10

# OAuth配置 (可选)
OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_GITHUB_CLIENT_ID=your_github_client_id
OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 高级配置

在`packages/server/src/config/auth.ts`中可以进行更详细的认证配置：

```typescript
import { env } from './env';

export const authConfig = {
  // JWT配置
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256',
    refreshExpiresIn: '30d',
  },
  
  // 密码策略
  password: {
    saltRounds: Number(env.PASSWORD_SALT_ROUNDS) || 10,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
  },
  
  // 登录尝试限制
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15分钟
  },
  
  // OAuth提供商
  oauth: {
    google: {
      clientId: env.OAUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET,
      callbackUrl: `${env.API_URL}/auth/google/callback`,
    },
    github: {
      clientId: env.OAUTH_GITHUB_CLIENT_ID,
      clientSecret: env.OAUTH_GITHUB_CLIENT_SECRET,
      callbackUrl: `${env.API_URL}/auth/github/callback`,
    },
  },
  
  // 会话配置 (用于基于会话的认证)
  session: {
    secret: env.SESSION_SECRET || env.JWT_SECRET,
    name: 'drycore.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    },
  },
};
```

## 核心概念

### 认证流程

DRYcore认证API支持以下认证流程：

1. **本地认证** - 使用用户名/邮箱和密码进行认证
2. **JWT认证** - 基于JSON Web Token的无状态认证
3. **OAuth认证** - 支持Google、GitHub等第三方认证提供商
4. **会话认证** - 传统的基于会话的认证

### 权限与角色

DRYcore使用基于角色的访问控制(RBAC)系统：

- **角色** - 用户可以拥有一个或多个角色(如ADMIN, USER, EDITOR等)
- **权限** - 每个角色拥有一组权限
- **资源** - 权限控制对系统资源的访问

## API参考

### 用户管理

#### `register(userData)`

注册新用户。

**参数:**

- `userData` (Object): 用户数据对象
  - `name` (string): 用户名
  - `email` (string): 用户邮箱
  - `password` (string): 用户密码
  - `role` (string, 可选): 用户角色，默认为'USER'

**返回:**

- Promise<Object>: 包含用户信息和JWT令牌的对象

**示例:**

```typescript
import { AuthService } from '@drycore/server';

const authService = new AuthService();

// 注册新用户
const result = await authService.register({
  name: '张三',
  email: 'zhangsan@example.com',
  password: 'SecurePassword123',
});

console.log('注册成功:', result.user);
console.log('JWT令牌:', result.token);
```

#### `login(credentials)`

用户登录。

**参数:**

- `credentials` (Object): 登录凭证
  - `email` (string): 用户邮箱
  - `password` (string): 用户密码

**返回:**

- Promise<Object>: 包含用户信息和JWT令牌的对象

**示例:**

```typescript
// 用户登录
const result = await authService.login({
  email: 'zhangsan@example.com',
  password: 'SecurePassword123',
});

if (result.success) {
  console.log('登录成功:', result.user);
  console.log('JWT令牌:', result.token);
} else {
  console.error('登录失败:', result.error);
}
```

#### `validateToken(token)`

验证JWT令牌有效性。

**参数:**

- `token` (string): JWT令牌

**返回:**

- Promise<Object | null>: 如果令牌有效，返回解码后的用户信息，否则返回null

**示例:**

```typescript
// 验证令牌
const userData = await authService.validateToken('your_jwt_token');

if (userData) {
  console.log('令牌有效，用户信息:', userData);
} else {
  console.log('令牌无效或已过期');
}
```

#### `refreshToken(refreshToken)`

刷新JWT令牌。

**参数:**

- `refreshToken` (string): 刷新令牌

**返回:**

- Promise<Object>: 包含新的访问令牌和刷新令牌的对象

**示例:**

```typescript
// 刷新令牌
const newTokens = await authService.refreshToken('your_refresh_token');

console.log('新的访问令牌:', newTokens.accessToken);
console.log('新的刷新令牌:', newTokens.refreshToken);
```

### 密码管理

#### `changePassword(userId, currentPassword, newPassword)`

更改用户密码。

**参数:**

- `userId` (number): 用户ID
- `currentPassword` (string): 当前密码
- `newPassword` (string): 新密码

**返回:**

- Promise<boolean>: 操作成功返回true，否则返回false

**示例:**

```typescript
// 更改密码
const success = await authService.changePassword(
  userId,
  'CurrentPassword123',
  'NewSecurePassword456'
);

if (success) {
  console.log('密码更改成功');
} else {
  console.error('密码更改失败');
}
```

#### `requestPasswordReset(email)`

请求密码重置。

**参数:**

- `email` (string): 用户邮箱

**返回:**

- Promise<Object>: 包含重置令牌的对象

**示例:**

```typescript
// 请求密码重置
const result = await authService.requestPasswordReset('zhangsan@example.com');

console.log('重置令牌已发送到邮箱');
```

#### `resetPassword(token, newPassword)`

使用重置令牌重置密码。

**参数:**

- `token` (string): 重置令牌
- `newPassword` (string): 新密码

**返回:**

- Promise<boolean>: 操作成功返回true，否则返回false

**示例:**

```typescript
// 重置密码
const success = await authService.resetPassword(
  'reset_token_from_email',
  'NewSecurePassword789'
);

if (success) {
  console.log('密码重置成功');
} else {
  console.error('密码重置失败');
}
```

### 角色与权限

#### `hasRole(userId, role)`

检查用户是否拥有指定角色。

**参数:**

- `userId` (number): 用户ID
- `role` (string): 角色名称

**返回:**

- Promise<boolean>: 用户拥有该角色返回true，否则返回false

**示例:**

```typescript
// 检查用户角色
const isAdmin = await authService.hasRole(userId, 'ADMIN');

if (isAdmin) {
  console.log('用户是管理员');
} else {
  console.log('用户不是管理员');
}
```

#### `hasPermission(userId, permission, resourceId?)`

检查用户是否拥有指定权限。

**参数:**

- `userId` (number): 用户ID
- `permission` (string): 权限名称
- `resourceId` (number, 可选): 资源ID

**返回:**

- Promise<boolean>: 用户拥有该权限返回true，否则返回false

**示例:**

```typescript
// 检查用户权限
const canEditArticle = await authService.hasPermission(
  userId,
  'EDIT_ARTICLE',
  articleId
);

if (canEditArticle) {
  console.log('用户可以编辑此文章');
} else {
  console.log('用户无权编辑此文章');
}
```

#### `assignRole(userId, role)`

为用户分配角色。

**参数:**

- `userId` (number): 用户ID
- `role` (string): 角色名称

**返回:**

- Promise<boolean>: 操作成功返回true，否则返回false

**示例:**

```typescript
// 分配角色
const success = await authService.assignRole(userId, 'EDITOR');

if (success) {
  console.log('已将编辑角色分配给用户');
} else {
  console.error('角色分配失败');
}
```

### OAuth认证

#### `getOAuthURL(provider)`

获取OAuth认证URL。

**参数:**

- `provider` (string): 认证提供商('google', 'github'等)

**返回:**

- string: OAuth认证URL

**示例:**

```typescript
// 获取Google OAuth URL
const googleAuthUrl = authService.getOAuthURL('google');

// 重定向用户到Google登录页面
res.redirect(googleAuthUrl);
```

#### `handleOAuthCallback(provider, code)`

处理OAuth回调。

**参数:**

- `provider` (string): 认证提供商
- `code` (string): 授权码

**返回:**

- Promise<Object>: 包含用户信息和JWT令牌的对象

**示例:**

```typescript
// 处理OAuth回调
app.get('/auth/google/callback', async (req, res) => {
  const result = await authService.handleOAuthCallback('google', req.query.code);
  
  if (result.success) {
    // 设置令牌并重定向
    res.cookie('auth-token', result.token);
    res.redirect('/dashboard');
  } else {
    res.redirect('/login?error=oauth_failed');
  }
});
```

### 中间件

#### `authMiddleware`

Express中间件，用于验证请求中的JWT令牌。

**示例:**

```typescript
import { authMiddleware } from '@drycore/server';

// 保护路由
app.get('/api/protected', authMiddleware, (req, res) => {
  // req.user包含已认证的用户信息
  res.json({ message: `欢迎，${req.user.name}!` });
});
```

#### `roleMiddleware(roles)`

Express中间件，用于基于角色的访问控制。

**参数:**

- `roles` (string | string[]): 需要的角色或角色数组

**示例:**

```typescript
import { roleMiddleware } from '@drycore/server';

// 只允许管理员访问
app.get(
  '/api/admin/users',
  authMiddleware,
  roleMiddleware('ADMIN'),
  (req, res) => {
    // 只有管理员可以访问
    res.json({ message: '管理员面板' });
  }
);

// 允许多个角色访问
app.get(
  '/api/content',
  authMiddleware,
  roleMiddleware(['ADMIN', 'EDITOR']),
  (req, res) => {
    // 管理员和编辑可以访问
    res.json({ message: '内容管理' });
  }
);
```

#### `permissionMiddleware(permission, resourceIdParam?)`

Express中间件，用于基于权限的访问控制。

**参数:**

- `permission` (string): 需要的权限
- `resourceIdParam` (string, 可选): 请求参数中的资源ID名称

**示例:**

```typescript
import { permissionMiddleware } from '@drycore/server';

// 基于权限控制
app.put(
  '/api/articles/:articleId',
  authMiddleware,
  permissionMiddleware('EDIT_ARTICLE', 'articleId'),
  (req, res) => {
    // 只有拥有编辑特定文章权限的用户才能访问
    res.json({ message: '文章已更新' });
  }
);
```

## 前端集成

### 使用React Hook

DRYcore为React应用提供了`useAuth` Hook，简化认证状态管理：

```tsx
import { useAuth } from '@drycore/web';

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### 使用AuthProvider

```tsx
import { AuthProvider } from '@drycore/web';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* 其他路由 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 保护路由

```tsx
import { useAuth } from '@drycore/web';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

### 基于角色的组件访问控制

```tsx
import { useAuth } from '@drycore/web';

function RoleBasedButton({ roles, children, ...props }) {
  const { user, hasRole } = useAuth();
  
  // 检查用户是否有任何指定角色
  const hasAccess = roles.some(role => hasRole(role));
  
  if (!hasAccess) {
    return null;
  }
  
  return <button {...props}>{children}</button>;
}

// 使用
function AdminPanel() {
  return (
    <div>
      <h1>控制面板</h1>
      <RoleBasedButton roles={['ADMIN']}>
        管理用户
      </RoleBasedButton>
      <RoleBasedButton roles={['ADMIN', 'EDITOR']}>
        管理内容
      </RoleBasedButton>
    </div>
  );
}
```

## 最佳实践

### 安全建议

1. **使用强密码策略** - 设置适当的密码复杂度要求
2. **实施速率限制** - 限制登录尝试次数，防止暴力攻击
3. **使用HTTPS** - 确保所有认证通信通过HTTPS进行
4. **安全存储密钥** - 使用环境变量存储JWT密钥等敏感信息
5. **设置合适的令牌过期时间** - 避免长时间有效的令牌
6. **实现CSRF保护** - 防止跨站请求伪造攻击

### 性能优化

1. **使用缓存** - 缓存频繁使用的用户数据和权限信息
2. **异步验证** - 使用异步验证减少阻塞
3. **批量加载权限** - 一次加载用户所有权限，避免多次数据库查询

## 常见问题

### 令牌验证失败

**问题:** JWT令牌验证失败，即使令牌看起来有效。

**解决方案:**
- 检查服务器和客户端的系统时间是否同步
- 确认JWT_SECRET在所有服务器实例上一致
- 验证令牌没有过期
- 检查令牌格式是否完整

### 权限系统设计

**问题:** 如何设计灵活且可扩展的权限系统？

**解决方案:**
- 使用基于角色的访问控制(RBAC)作为基础
- 将权限定义为"动作:资源"格式，如"read:articles"
- 实现资源所有权检查，允许用户管理自己的资源
- 使用权限组简化管理

### OAuth集成

**问题:** 集成第三方OAuth提供商时遇到问题。

**解决方案:**
- 确保回调URL配置正确且与提供商注册的一致
- 检查客户端ID和密钥是否正确
- 在OAuth流程中加入状态参数防止CSRF攻击
- 处理OAuth提供商API的错误响应

## 示例：完整认证流程

### 后端实现

```typescript
// packages/server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  // 用户注册
  async register(req: Request, res: Response) {
    try {
      const result = await this.authService.register(req.body);
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          data: {
            user: result.user,
            token: result.token,
          },
        });
      }
      
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '注册过程中发生错误',
      });
    }
  }

  // 用户登录
  async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(req.body);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: {
            user: result.user,
            token: result.token,
          },
        });
      }
      
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '登录过程中发生错误',
      });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req: Request, res: Response) {
    try {
      // req.user由authMiddleware注入
      const userId = req.user.id;
      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '获取用户信息时发生错误',
      });
    }
  }

  // 刷新令牌
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: '缺少刷新令牌',
        });
      }
      
      const result = await this.authService.refreshToken(refreshToken);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        });
      }
      
      return res.status(401).json({
        success: false,
        error: '无效或过期的刷新令牌',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '刷新令牌时发生错误',
      });
    }
  }

  // 请求密码重置
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: '缺少邮箱地址',
        });
      }
      
      const result = await this.authService.requestPasswordReset(email);
      
      // 注意：无论邮箱是否存在，都返回相同响应
      // 这是安全最佳实践，防止用户枚举
      return res.status(200).json({
        success: true,
        message: '如果邮箱存在，重置链接已发送',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '处理密码重置请求时发生错误',
      });
    }
  }

  // 重置密码
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: '缺少令牌或新密码',
        });
      }
      
      const result = await this.authService.resetPassword(token, newPassword);
      
      if (result) {
        return res.status(200).json({
          success: true,
          message: '密码已成功重置',
        });
      }
      
      return res.status(400).json({
        success: false,
        error: '无效或过期的重置令牌',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '重置密码时发生错误',
      });
    }
  }

  // OAuth登录URL
  getOAuthURL(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      
      if (!['google', 'github'].includes(provider)) {
        return res.status(400).json({
          success: false,
          error: '不支持的OAuth提供商',
        });
      }
      
      const url = this.authService.getOAuthURL(provider);
      
      return res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '生成OAuth URL时发生错误',
      });
    }
  }

  // OAuth回调处理
  async handleOAuthCallback(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: '缺少授权码',
        });
      }
      
      const result = await this.authService.handleOAuthCallback(provider, code);
      
      if (result.success) {
        // 使用客户端重定向，将令牌作为URL参数
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`
        );
      }
      
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed`
      );
    } catch (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=server_error`
      );
    }
  }
}
```

### 路由配置

```typescript
// packages/server/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { authValidation } from '../validations/auth.validation';

export const authRouter = Router();
const authController = new AuthController();

// 用户注册
authRouter.post(
  '/register',
  validateRequest(authValidation.register),
  authController.register.bind(authController)
);

// 用户登录
authRouter.post(
  '/login',
  validateRequest(authValidation.login),
  authController.login.bind(authController)
);

// 获取当前用户
authRouter.get(
  '/me',
  authMiddleware,
  authController.getCurrentUser.bind(authController)
);

// 刷新令牌
authRouter.post(
  '/refresh-token',
  validateRequest(authValidation.refreshToken),
  authController.refreshToken.bind(authController)
);

// 请求密码重置
authRouter.post(
  '/request-reset',
  validateRequest(authValidation.requestReset),
  authController.requestPasswordReset.bind(authController)
);

// 重置密码
authRouter.post(
  '/reset-password',
  validateRequest(authValidation.resetPassword),
  authController.resetPassword.bind(authController)
);

// OAuth登录URL
authRouter.get(
  '/oauth/:provider',
  authController.getOAuthURL.bind(authController)
);

// OAuth回调
authRouter.get(
  '/oauth/:provider/callback',
  authController.handleOAuthCallback.bind(authController)
);
```

### 前端实现

```tsx
// packages/web/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 获取当前用户信息
  const fetchCurrentUser = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        // 无效令牌，清除本地存储
        localStorage.removeItem('auth-token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('auth-token');
      setUser(null);
      setError('获取用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('auth-token', token);
        setUser(user);
      } else {
        setError(response.data.error || '登录失败');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || '登录过程中发生错误'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 注册
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('auth-token', token);
        setUser(user);
      } else {
        setError(response.data.error || '注册失败');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || '注册过程中发生错误'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  // 检查角色
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles?.includes(role) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  
  return context;
}
```

## 小结

DRYcore认证API提供了一个全面、灵活的身份验证和授权解决方案，支持多种认证方式和权限管理。通过遵循本文档的最佳实践和示例，你可以轻松地在你的应用中实现安全、可靠的用户认证系统。 