import dotenv from 'dotenv';
import path from 'path';

// 根据NODE_ENV加载对应的环境变量
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test' 
    ? '.env.test' 
    : '.env';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// 定义环境变量配置
export const env = {
  // 环境
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 数据库
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/drycore',
  
  // 服务器
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || 'localhost',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret-replace-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // API文档
  API_DOCS_ENABLED: process.env.API_DOCS_ENABLED === 'true',
  API_DOCS_PATH: process.env.API_DOCS_PATH || '/api/docs',
  
  // 日志
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED === 'true',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'logs/app.log',
  
  // 缓存
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // 邮件
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  
  // 文件上传
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  
  // 是否为开发环境
  isDev: () => env.NODE_ENV === 'development',
  
  // 是否为生产环境
  isProd: () => env.NODE_ENV === 'production',
  
  // 是否为测试环境
  isTest: () => env.NODE_ENV === 'test'
} as const;

// 输出环境配置
if (env.isDev()) {
  console.log('Environment:', env.NODE_ENV);
  console.log('Server:', `${env.HOST}:${env.PORT}`);
  console.log('API Docs:', env.API_DOCS_ENABLED ? env.API_DOCS_PATH : 'Disabled');
} 