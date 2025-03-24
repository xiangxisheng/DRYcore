import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middlewares/auth';

const prisma = new PrismaClient();
const userRouter = new Hono();

// 获取用户列表
userRouter.get('/', authMiddleware(['user:view']), async (c) => {
  try {
    // 分页参数
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // 查询参数
    const search = c.req.query('search') || '';
    const status = c.req.query('status') ? Number(c.req.query('status')) : undefined;
    
    // 构建查询条件
    const where = {
      OR: search ? [
        { username: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ] : undefined,
      status: status !== undefined ? status : undefined,
    };
    
    // 查询用户数据
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    
    return c.json({
      status: 'success',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '获取用户列表失败', 
      error: error.message 
    }, 500);
  }
});

// 获取单个用户
userRouter.get('/:id', authMiddleware(['user:view']), async (c) => {
  try {
    const id = Number(c.req.param('id'));
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
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
    
    return c.json({
      status: 'success',
      data: user,
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '获取用户详情失败', 
      error: error.message 
    }, 500);
  }
});

// 创建用户验证模式
const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(100),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.number().int().min(0).max(1).default(1),
  roleIds: z.array(z.number().int()).optional(),
});

// 创建用户
userRouter.post('/', authMiddleware(['user:create']), zValidator('json', createUserSchema), async (c) => {
  const { username, password, name, email, phone, status, roleIds } = c.req.valid('json');
  
  try {
    // 检查用户名是否已存在
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
        name,
        email,
        phone,
        status,
        ...(roleIds && roleIds.length > 0 && {
          roles: {
            connect: roleIds.map(id => ({ id })),
          },
        }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    
    return c.json({
      status: 'success',
      message: '创建用户成功',
      data: user,
    }, 201);
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '创建用户失败', 
      error: error.message 
    }, 500);
  }
});

// 更新用户验证模式
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  status: z.number().int().min(0).max(1).optional(),
  password: z.string().min(6).max(100).optional(),
  roleIds: z.array(z.number().int()).optional(),
});

// 更新用户
userRouter.put('/:id', authMiddleware(['user:update']), zValidator('json', updateUserSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { name, email, phone, avatar, status, password, roleIds } = c.req.valid('json');
  
  try {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return c.json({ 
        status: 'error', 
        message: '用户不存在' 
      }, 404);
    }
    
    // 检查邮箱是否已被其他用户使用
    if (email && email !== existingUser.email) {
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
    
    // 准备更新数据
    const updateData: any = {
      name,
      email,
      phone,
      avatar,
      status,
    };
    
    // 如果提供了密码，则进行哈希处理
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // 更新角色关系
    const roleUpdates = roleIds !== undefined ? {
      roles: {
        set: [],
        connect: roleIds.map(roleId => ({ id: roleId })),
      },
    } : {};
    
    // 更新用户
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...roleUpdates,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    
    return c.json({
      status: 'success',
      message: '更新用户成功',
      data: user,
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '更新用户失败', 
      error: error.message 
    }, 500);
  }
});

// 删除用户
userRouter.delete('/:id', authMiddleware(['user:delete']), async (c) => {
  try {
    const id = Number(c.req.param('id'));
    
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return c.json({ 
        status: 'error', 
        message: '用户不存在' 
      }, 404);
    }
    
    // 删除用户
    await prisma.user.delete({
      where: { id },
    });
    
    return c.json({
      status: 'success',
      message: '删除用户成功',
    });
  } catch (error: any) {
    return c.json({ 
      status: 'error', 
      message: '删除用户失败', 
      error: error.message 
    }, 500);
  }
});

export { userRouter }; 