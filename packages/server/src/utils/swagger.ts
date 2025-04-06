import { Hono } from 'hono';
import swaggerUI from 'swagger-ui-express';
import { load } from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 设置Swagger文档
 * 配置Swagger UI并加载OpenAPI定义
 * 
 * @param app Hono应用实例
 */
export function setupSwagger(app: Hono): void {
  try {
    // 获取当前工作目录
    const cwd = process.cwd();
    
    // 加载OpenAPI定义文件
    const apiSpecPath = path.join(cwd, 'src', 'api-docs', 'openapi.yaml');
    
    if (!fs.existsSync(apiSpecPath)) {
      console.warn('Swagger文档文件不存在:', apiSpecPath);
      return;
    }
    
    // 读取并解析YAML文件
    const apiSpecContent = fs.readFileSync(apiSpecPath, 'utf8');
    const apiSpec = load(apiSpecContent) as Record<string, any>;
    
    // 设置基本信息
    if (!apiSpec.info) {
      apiSpec.info = {
        title: 'DRYcore API',
        version: '1.0.0',
        description: 'DRYcore框架API文档'
      };
    }
    
    // 配置Swagger UI路由
    app.get('/api-docs', (c) => {
      // 由于Hono与Express兼容性问题，自定义简单的Swagger UI页面
      const html = generateSwaggerUIHtml(apiSpec);
      return c.html(html);
    });
    
    // 配置OpenAPI JSON端点
    app.get('/api-docs/swagger.json', (c) => {
      return c.json(apiSpec);
    });
    
    console.log('Swagger文档已设置，访问 /api-docs 查看API文档');
  } catch (error: any) {
    console.error('设置Swagger文档失败:', error.message);
  }
}

/**
 * 生成Swagger UI HTML页面
 * 
 * @param apiSpec OpenAPI规范对象
 * @returns HTML字符串
 */
function generateSwaggerUIHtml(apiSpec: Record<string, any>): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${apiSpec.info?.title || 'API文档'}</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.1.0/swagger-ui.css">
      <style>
        body { margin: 0; padding: 0; }
        #swagger-ui { max-width: 1200px; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.1.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: "/api-docs/swagger.json",
            dom_id: "#swagger-ui",
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
          });
        }
      </script>
    </body>
    </html>
  `;
} 