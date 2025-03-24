import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { config } from '../config';
import { authMiddleware } from '../middlewares/auth';

const prisma = new PrismaClient();
const authRouter = new Hono();

// 注册验证模式
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(100),
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

// 登录验证模式
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// 用户注册
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { username, password, email, name, phone } = c.req.valid('json');

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return c.json({ 
        status: 'error', 
        message: '用户名已存在' 
      }, 400);
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return c.json({ 
          status: 'error', 
          message: '邮箱已被使用' 
        }, 400);
      }
    }

    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
        phone,
        status: 1,
      },
    });

    // 为新用户分配默认角色
    const defaultRole = await prisma.role.findFirst({
      where: { code: 'user' },
    });

    if (defaultRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: defaultRole.id },
          },
        },
      });
    }

    return c.json({
      status: 'success',
      message: '用户注册成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    }, 201);
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '注册失败', 
      error: error.message 
    }, 500);
  }
});

// 用户登录
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');

  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return c.json({ 
        status: 'error', 
        message: '用户名或密码错误' 
      }, 401);
    }

    // 验证用户状态
    if (user.status === 0) {
      return c.json({ 
        status: 'error', 
        message: '账户已被禁用' 
      }, 403);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ 
        status: 'error', 
        message: '用户名或密码错误' 
      }, 401);
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 获取用户权限
    const permissions = user.roles.flatMap(role => 
      role.permissions.map(permission => permission.code)
    );

    return c.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          roles: user.roles.map(role => role.code),
          permissions,
        },
      },
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '登录失败', 
      error: error.message 
    }, 500);
  }
});

// 获取当前用户信息
authRouter.get('/profile', authMiddleware(), async (c) => {
  try {
    const userContext = c.get('user');
    
    if (!userContext) {
      return c.json({ 
        status: 'error', 
        message: '未授权访问' 
      }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userContext.id },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return c.json({ 
        status: 'error', 
        message: '用户不存在' 
      }, 404);
    }

    // 获取用户权限
    const permissions = user.roles.flatMap(role => 
      role.permissions.map(permission => permission.code)
    );

    return c.json({
      status: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        roles: user.roles.map(role => ({
          id: role.id,
          name: role.name,
          code: role.code,
        })),
        permissions,
      },
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '获取用户信息失败', 
      error: error.message 
    }, 500);
  }
});

// 更新用户密码
authRouter.put('/password', authMiddleware(), zValidator('json', z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6).max(100),
})), async (c) => {
  const { currentPassword, newPassword } = c.req.valid('json');
  const userContext = c.get('user');

  try {
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userContext.id },
    });

    if (!user) {
      return c.json({ 
        status: 'error', 
        message: '用户不存在' 
      }, 404);
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return c.json({ 
        status: 'error', 
        message: '当前密码错误' 
      }, 400);
    }

    // 对新密码进行哈希处理
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return c.json({
      status: 'success',
      message: '密码更新成功',
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '更新密码失败', 
      error: error.message 
    }, 500);
  }
});

// 退出登录
authRouter.post('/logout', (c) => {
  return c.json({
    status: 'success',
    message: '退出登录成功',
  });
});

export { authRouter }; 