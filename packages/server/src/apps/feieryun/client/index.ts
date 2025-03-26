import { Hono } from 'hono';
import { clientRouter } from './routes';

interface Context {
  get: (key: string) => any;
  next: () => Promise<any>;
  html: (content: string) => any;
}

/**
 * 飞儿云用户前台应用
 */
const clientApp = {
  name: 'feieryun-client',
  type: 'client',
  description: '飞儿云用户前台',
  domain: 'www.feieryun.com',
  
  /**
   * 注册用户前台应用
   * @param app Hono应用实例
   */
  register: (app: Hono) => {
    // 注册用户前台路由
    try {
      app.route('/client', clientRouter);
    } catch (error) {
      console.warn('注册客户端路由失败:', error);
      // 创建默认路由
      const defaultRouter = new Hono();
      app.route('/client', defaultRouter);
    }
    
    // 注册HTML页面渲染
    app.get('*', async (c: Context) => {
      const appInfo = c.get('appInfo');
      if (appInfo?.type !== 'client') return c.next();
      
      return c.html(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>飞儿云 - 您的云服务专家</title>
          <link rel="stylesheet" href="/client/assets/styles.css">
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.__INITIAL_CONFIG__ = {
              apiPath: '/client/api',
              appType: 'client'
            };
          </script>
          <script src="/client/assets/main.js"></script>
        </body>
        </html>
      `);
    });
  }
};

export default clientApp; 