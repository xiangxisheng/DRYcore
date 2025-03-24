import { Hono } from 'hono';
import { adminRouter } from './routes';

/**
 * 飞儿云管理后台应用
 */
const adminApp = {
  name: 'feieryun-admin',
  type: 'admin',
  description: '飞儿云管理后台',
  domain: 'admin.feieryun.com',
  
  /**
   * 注册管理后台应用
   * @param app Hono应用实例
   */
  register: (app: Hono) => {
    // 注册管理后台路由
    app.route('/admin', adminRouter);
    
    // 注册HTML页面渲染
    app.get('*', async (c) => {
      return c.html(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>飞儿云管理后台</title>
          <link rel="stylesheet" href="/admin/assets/styles.css">
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.__INITIAL_CONFIG__ = {
              apiPath: '/admin/api',
              appType: 'admin'
            };
          </script>
          <script src="/admin/assets/main.js"></script>
        </body>
        </html>
      `);
    });
  }
};

export default adminApp; 