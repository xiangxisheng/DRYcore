import { Context, MiddlewareHandler, Next } from 'hono';

interface ErrorResponse {
  status: 'error';
  message: string;
  code: number;
  timestamp: string;
  path: string;
  stack?: string;
}

export const errorMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    console.error('Error occurred:', error);

    // 默认错误状态为500
    const status = error.status || 500;
    
    const errorResponse: ErrorResponse = {
      status: 'error',
      message: error.message || 'Internal Server Error',
      code: status,
      timestamp: new Date().toISOString(),
      path: c.req.path,
    };

    // 仅在开发环境下显示堆栈信息
    if (process.env.NODE_ENV === 'development' && error.stack) {
      errorResponse.stack = error.stack;
    }

    return c.json(errorResponse, status);
  }
}; 