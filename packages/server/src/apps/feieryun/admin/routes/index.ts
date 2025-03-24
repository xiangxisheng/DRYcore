import { Hono } from 'hono';
import { adminDashboardRouter } from './dashboard';
import { adminServerRouter } from './server';
import { adminDomainRouter } from './domain';
import { adminStorageRouter } from './storage';
import { adminDatabaseRouter } from './database';
import { adminWebsiteRouter } from './website';
import { adminSystemRouter } from './system';

const adminRouter = new Hono();

// 添加管理后台子路由
adminRouter.route('/dashboard', adminDashboardRouter);
adminRouter.route('/cloud-server', adminServerRouter);
adminRouter.route('/domain', adminDomainRouter);
adminRouter.route('/storage', adminStorageRouter);
adminRouter.route('/database', adminDatabaseRouter);
adminRouter.route('/website', adminWebsiteRouter);
adminRouter.route('/system', adminSystemRouter);

export { adminRouter }; 