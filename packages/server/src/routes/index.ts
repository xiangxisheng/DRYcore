import { Hono } from 'hono';
import { authRouter } from './auth';
import { userRouter } from './user';
import { roleRouter } from './role';
import { permissionRouter } from './permission';
import { serverRouter } from './server';
import { domainRouter } from './domain';
import { storageRouter } from './storage';
import { databaseRouter } from './database';
import { websiteRouter } from './website';
import { configRouter } from './config';

// 创建API路由器
const apiRouter = new Hono();

// 添加子路由
apiRouter.route('/auth', authRouter);
apiRouter.route('/users', userRouter);
apiRouter.route('/roles', roleRouter);
apiRouter.route('/permissions', permissionRouter);
apiRouter.route('/servers', serverRouter);
apiRouter.route('/domains', domainRouter);
apiRouter.route('/storages', storageRouter);
apiRouter.route('/databases', databaseRouter);
apiRouter.route('/websites', websiteRouter);
apiRouter.route('/config', configRouter);

export default apiRouter; 