import { Context, Next } from 'hono';

// 声明Node.js环境变量类型
declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  };
};

/**
 * 统一错误处理中间件
 * 捕获并处理请求处理过程中抛出的错误
 * 
 * @param c Hono上下文
 * @param next 下一个中间件
 */
export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    console.error('请求处理出错:', error);
    
    const status = error.status || 500;
    const message = error.message || '服务器内部错误';
    
    // 开发环境返回详细错误信息
    const isDev = process.env.NODE_ENV === 'development';
    const response = {
      success: false,
      error: {
        message,
        ...(isDev && error.stack ? { stack: error.stack } : {}),
        ...(isDev && error.details ? { details: error.details } : {})
      }
    };
    
    return c.json(response, status);
  }
}; 