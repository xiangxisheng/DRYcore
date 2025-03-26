import { Hono } from 'hono';
import { serverController } from '@/core/controllers/server';
import { domainController } from '@/core/controllers/domain';
import { storageController } from '@/core/controllers/storage';
import { databaseController } from '@/core/controllers/database';
import { websiteController } from '@/core/controllers/website';

// 创建API路由
export const apiRouter = new Hono();

// 服务器API
const serverRouter = new Hono();
serverRouter.get('/', serverController.list);
serverRouter.get('/:id', serverController.getById);
apiRouter.route('/servers', serverRouter);

// 域名API
const domainRouter = new Hono();
domainRouter.get('/', domainController.list);
domainRouter.get('/:id', domainController.getById);
apiRouter.route('/domains', domainRouter);

// 存储API
const storageRouter = new Hono();
storageRouter.get('/', storageController.list);
storageRouter.get('/:id', storageController.getById);
apiRouter.route('/storage', storageRouter);

// 数据库API
const databaseRouter = new Hono();
databaseRouter.get('/', databaseController.list);
databaseRouter.get('/:id', databaseController.getById);
apiRouter.route('/databases', databaseRouter);

// 网站API
const websiteRouter = new Hono();
websiteRouter.get('/', websiteController.list);
websiteRouter.get('/:id', websiteController.getById);
apiRouter.route('/websites', websiteRouter);

// 用户信息API
apiRouter.get('/user/profile', (c: { json: (data: any) => any }) => {
  return c.json({
    status: 'success',
    data: {
      id: 'test-user',
      username: '测试用户',
      email: 'test@example.com',
      role: 'user'
    }
  });
}); 