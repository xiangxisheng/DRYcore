import { Hono } from 'hono';
import { serveStatic } from 'hono/serve-static';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { config } from '../config';

// 默认API文档信息
const DEFAULT_API_INFO = {
  openapi: '3.0.0',
  info: {
    title: '飞儿云 API',
    version: '1.0.0',
    description: '飞儿云服务平台API文档',
    contact: {
      name: '飞儿云技术团队',
      email: 'support@feieryun.com',
    },
  },
  servers: [
    {
      url: `http://${config.server.host}:${config.server.port}`,
      description: '开发服务器',
    },
    {
      url: 'https://api.feieryun.com',
      description: '生产服务器',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [],
  paths: {},
};

/**
 * 设置Swagger UI
 */
export function setupSwagger(app: Hono): void {
  const apiDocsPath = config.apiDocs.path;
  
  // 创建存放OpenAPI定义的目录
  const openApiDir = path.resolve(__dirname, '../../openapi');
  if (!fs.existsSync(openApiDir)) {
    fs.mkdirSync(openApiDir, { recursive: true });
  }

  // 获取API定义文件列表
  const apiSpecFiles = getApiSpecFiles();
  
  // 合并API定义
  const mergedSpec = mergeApiSpecs(apiSpecFiles);
  
  // 保存合并后的API定义
  const mergedSpecPath = path.resolve(openApiDir, 'openapi.json');
  fs.writeFileSync(mergedSpecPath, JSON.stringify(mergedSpec, null, 2));
  
  // 提供Swagger UI
  app.get(apiDocsPath, async (c) => {
    // 重定向到Swagger UI
    return c.redirect(`${apiDocsPath}/index.html`);
  });

  // 提供OpenAPI定义文件
  app.get(`${apiDocsPath}/openapi.json`, (c) => {
    return c.json(mergedSpec);
  });

  // 提供Swagger UI静态文件
  app.use(`${apiDocsPath}/*`, serveStatic({
    root: './node_modules/swagger-ui-dist',
    rewriteRequestPath: (path) => {
      return path.replace(apiDocsPath, '');
    }
  }));
}

/**
 * 获取API定义文件列表
 */
function getApiSpecFiles(): string[] {
  const controllersDir = path.resolve(__dirname, '../controllers');
  const apiSpecFiles: string[] = [];
  
  if (fs.existsSync(controllersDir)) {
    const files = fs.readdirSync(controllersDir);
    
    files.forEach(file => {
      if (file.endsWith('.openapi.yaml') || file.endsWith('.openapi.yml') || file.endsWith('.openapi.json')) {
        apiSpecFiles.push(path.join(controllersDir, file));
      }
    });
  }
  
  return apiSpecFiles;
}

/**
 * 合并API定义文件
 */
function mergeApiSpecs(apiSpecFiles: string[]): any {
  const mergedSpec = { ...DEFAULT_API_INFO };
  
  apiSpecFiles.forEach(file => {
    try {
      let spec;
      
      if (file.endsWith('.json')) {
        spec = JSON.parse(fs.readFileSync(file, 'utf8'));
      } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        spec = YAML.parse(fs.readFileSync(file, 'utf8'));
      }
      
      if (!spec) return;
      
      // 合并标签
      if (spec.tags && Array.isArray(spec.tags)) {
        mergedSpec.tags = [
          ...mergedSpec.tags,
          ...spec.tags.filter((tag: any) => !mergedSpec.tags.some((t: any) => t.name === tag.name))
        ];
      }
      
      // 合并路径
      if (spec.paths) {
        mergedSpec.paths = { ...mergedSpec.paths, ...spec.paths };
      }
      
      // 合并组件
      if (spec.components) {
        mergedSpec.components = {
          ...mergedSpec.components,
          schemas: { ...(mergedSpec.components.schemas || {}), ...(spec.components.schemas || {}) },
          responses: { ...(mergedSpec.components.responses || {}), ...(spec.components.responses || {}) },
          parameters: { ...(mergedSpec.components.parameters || {}), ...(spec.components.parameters || {}) },
          examples: { ...(mergedSpec.components.examples || {}), ...(spec.components.examples || {}) },
          requestBodies: { ...(mergedSpec.components.requestBodies || {}), ...(spec.components.requestBodies || {}) },
          headers: { ...(mergedSpec.components.headers || {}), ...(spec.components.headers || {}) },
          securitySchemes: { ...(mergedSpec.components.securitySchemes || {}), ...(spec.components.securitySchemes || {}) },
        };
      }
    } catch (error) {
      console.error(`Failed to parse API spec file: ${file}`, error);
    }
  });
  
  return mergedSpec;
} 