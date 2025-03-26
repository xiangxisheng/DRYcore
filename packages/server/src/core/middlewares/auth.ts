import { Context, MiddlewareHandler, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthUser {
  id: number;
  username: string;
  roles: string[];
}

class AuthError extends Error {
  status: number;

  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

// 示例用户数据（实际应用中应从数据库或认证服务获取）
const DEMO_USERS = {
  'admin-token': {
    id: 'admin',
    username: 'admin',
    roles: ['admin'],
    permissions: ['*'] // 管理员拥有所有权限
  },
  'user-token': {
    id: 'user1',
    username: '普通用户',
    roles: ['user'],
    permissions: [
      'server:view',
      'domain:view',
      'storage:view',
      'database:view'
    ]
  }
};

/**
 * 认证中间件
 * 检查请求中的认证信息，并将用户信息添加到上下文中
 */
export const authMiddleware = async (c: Context, next: Next) => {
  // 从请求头获取认证令牌
  const token = c.req.header('Authorization')?.replace('Bearer ', '') || '';
  
  // 检查令牌并获取用户信息
  // 在实际应用中，这里应该验证JWT令牌或从数据库查询用户信息
  const user = DEMO_USERS[token];
  
  if (user) {
    // 将用户信息添加到请求上下文
    c.set('user', user);
  } else {
    // 为了演示，如果没有令牌，使用默认游客用户
    c.set('user', {
      id: 'guest',
      username: '游客',
      roles: ['guest'],
      permissions: []
    });
  }
  
  await next();
};

export const authMiddlewareWithPermissions = (requiredPermissions?: string[]): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    try {
      // 获取Authorization头
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthError('Authorization header is missing or invalid');
      }

      // 提取Token
      const token = authHeader.substring(7);
      
      if (!token) {
        throw new AuthError('JWT token is missing');
      }

      // 验证Token
      const decoded = jwt.verify(token, config.jwt.secret) as { 
        userId: number;
        username: string;
      };

      // 获取用户信息和角色
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roles: {
            include: {
              permissions: true
            }
          }
        }
      });

      if (!user) {
        throw new AuthError('User not found');
      }

      if (user.status === 0) {
        throw new AuthError('User is disabled', 403);
      }

      // 提取用户权限
      const userPermissions = user.roles.flatMap(role => 
        role.permissions.map(permission => permission.code)
      );

      // 检查是否具有所需权限
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          throw new AuthError('Insufficient permissions', 403);
        }
      }

      // 设置用户信息到请求上下文
      c.set('user', {
        id: user.id,
        username: user.username,
        roles: user.roles.map(role => role.code),
        permissions: userPermissions
      });

      return await next();
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new AuthError('Token expired');
      }
      throw error;
    }
  };
}; 