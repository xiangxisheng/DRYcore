import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import YAML from 'yaml';

// 初始化Prisma客户端
const prisma = new PrismaClient();

// API文档的基本结构
const baseOpenApi = {
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
      url: 'http://localhost:3000',
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
    schemas: {},
    responses: {
      UnauthorizedError: {
        description: '未授权',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: '未授权' },
                code: { type: 'integer', example: 401 },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string', example: '/api/users' },
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: '禁止访问',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: '禁止访问' },
                code: { type: 'integer', example: 403 },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string', example: '/api/users' },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: '资源不存在',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: '资源不存在' },
                code: { type: 'integer', example: 404 },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string', example: '/api/users/999' },
              },
            },
          },
        },
      },
      ValidationError: {
        description: '验证错误',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: '验证错误' },
                code: { type: 'integer', example: 400 },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string', example: '/api/users' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'username' },
                      message: { type: 'string', example: '用户名不能为空' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'error' },
                message: { type: 'string', example: '服务器错误' },
                code: { type: 'integer', example: 500 },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string', example: '/api/users' },
              },
            },
          },
        },
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
 * 从Prisma模型生成OpenAPI定义
 */
async function generateApiDocs() {
  try {
    console.log('生成API文档...');
    
    // 获取Prisma元数据
    const dmmf = (prisma as any)._baseDmmf;
    
    // 创建输出目录
    const outputDir = path.resolve(__dirname, '../../openapi');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 复制baseOpenApi对象
    const openApi = { ...baseOpenApi };
    
    // 为每个模型添加标签
    dmmf.modelMap.forEach((model: any) => {
      openApi.tags.push({
        name: model.name,
        description: `${model.name} 相关操作`,
      });
      
      // 为模型添加schema
      openApi.components.schemas[model.name] = {
        type: 'object',
        properties: {},
        required: [],
      };
      
      // 为模型的每个字段添加属性
      model.fields.forEach((field: any) => {
        // 处理不同类型的字段
        let schema: any = {};
        
        switch (field.type) {
          case 'Int':
            schema = { type: 'integer' };
            break;
          case 'String':
            schema = { type: 'string' };
            break;
          case 'Boolean':
            schema = { type: 'boolean' };
            break;
          case 'DateTime':
            schema = { type: 'string', format: 'date-time' };
            break;
          default:
            if (dmmf.modelMap.has(field.type)) {
              // 处理关系
              schema = { 
                type: 'object', 
                $ref: `#/components/schemas/${field.type}` 
              };
            } else {
              schema = { type: 'string' };
            }
        }
        
        // 处理数组
        if (field.isList) {
          schema = {
            type: 'array',
            items: schema,
          };
        }
        
        // 添加属性
        openApi.components.schemas[model.name].properties[field.name] = schema;
        
        // 添加必填属性
        if (field.isRequired) {
          openApi.components.schemas[model.name].required.push(field.name);
        }
      });
      
      // 添加CRUD路径
      openApi.paths[`/api/${model.name.toLowerCase()}`] = {
        get: {
          tags: [model.name],
          summary: `获取${model.name}列表`,
          description: `获取所有${model.name}记录`,
          operationId: `getAll${model.name}`,
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: '页码',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: '每页记录数',
              schema: { type: 'integer', default: 10 },
            },
            {
              name: 'sort',
              in: 'query',
              description: '排序字段',
              schema: { type: 'string' },
            },
            {
              name: 'order',
              in: 'query',
              description: '排序方向',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
          ],
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'array',
                        items: { $ref: `#/components/schemas/${model.name}` },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          tags: [model.name],
          summary: `创建${model.name}`,
          description: `创建新的${model.name}记录`,
          operationId: `create${model.name}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${model.name}` },
              },
            },
          },
          responses: {
            '201': {
              description: '创建成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: `#/components/schemas/${model.name}` },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      };
      
      openApi.paths[`/api/${model.name.toLowerCase()}/{id}`] = {
        get: {
          tags: [model.name],
          summary: `获取单个${model.name}`,
          description: `根据ID获取${model.name}记录`,
          operationId: `get${model.name}`,
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: '记录ID',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: `#/components/schemas/${model.name}` },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
        put: {
          tags: [model.name],
          summary: `更新${model.name}`,
          description: `更新指定ID的${model.name}记录`,
          operationId: `update${model.name}`,
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: '记录ID',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${model.name}` },
              },
            },
          },
          responses: {
            '200': {
              description: '更新成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: `#/components/schemas/${model.name}` },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/ValidationError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
        delete: {
          tags: [model.name],
          summary: `删除${model.name}`,
          description: `删除指定ID的${model.name}记录`,
          operationId: `delete${model.name}`,
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: '记录ID',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': {
              description: '删除成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: '删除成功' },
                    },
                  },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      };
    });
    
    // 将OpenAPI定义写入文件
    const jsonOutputPath = path.resolve(outputDir, 'openapi.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(openApi, null, 2));
    
    const yamlOutputPath = path.resolve(outputDir, 'openapi.yaml');
    fs.writeFileSync(yamlOutputPath, YAML.stringify(openApi));
    
    console.log('API文档生成成功！');
    console.log(`JSON 文档: ${jsonOutputPath}`);
    console.log(`YAML 文档: ${yamlOutputPath}`);
  } catch (error) {
    console.error('生成API文档失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行生成器
generateApiDocs(); 