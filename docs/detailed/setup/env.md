# 环境配置

## 功能说明

DRYcore 使用环境变量来配置不同环境下的应用行为。通过集中式环境配置，可以轻松在开发、测试和生产环境之间切换，而无需修改代码。

## 环境变量文件

DRYcore 支持以下环境变量文件：

- `.env` - 默认环境变量文件，用于开发环境
- `.env.development` - 开发环境专用配置（可选）
- `.env.test` - 测试环境专用配置
- `.env.production` - 生产环境专用配置
- `.env.local` - 本地环境配置，不纳入版本控制

项目在启动时，根据当前的 `NODE_ENV` 环境变量自动选择合适的环境变量文件。

## 环境变量示例

以下是一个典型的 `.env.example` 文件示例，包含了所有可配置的环境变量：

```bash
# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/drycore"

# 服务器配置
PORT=3000
HOST="localhost"
NODE_ENV="development" # development, production, test

# JWT配置
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# API文档配置
API_DOCS_ENABLED=true
API_DOCS_PATH="/api/docs"

# 日志配置
LOG_LEVEL="info" # error, warn, info, http, verbose, debug, silly
LOG_FILE_ENABLED=false
LOG_FILE_PATH="logs/app.log"

# 缓存配置
REDIS_ENABLED=false
REDIS_URL="redis://localhost:6379"

# 邮件配置
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="your-password"
SMTP_FROM="noreply@example.com"

# 文件上传配置
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="10mb"
```

## 配置加载机制

环境变量通过 `src/config/env.ts` 文件加载和处理：

```typescript
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
  
  // ... 其他配置 ...
  
  // 环境检测帮助函数
  isDev: () => env.NODE_ENV === 'development',
  isProd: () => env.NODE_ENV === 'production',
  isTest: () => env.NODE_ENV === 'test'
} as const;
```

## 使用方法

在代码中使用环境配置：

```typescript
import { env } from '@config/env';

// 使用数据库配置
console.log('数据库连接：', env.DATABASE_URL);

// 根据环境执行不同逻辑
if (env.isDev()) {
  console.log('开发环境特定逻辑');
} else if (env.isProd()) {
  console.log('生产环境特定逻辑');
}

// 使用端口配置启动服务器
app.listen(env.PORT, env.HOST, () => {
  console.log(`服务器运行于 http://${env.HOST}:${env.PORT}`);
});
```

## 安全最佳实践

1. **敏感信息保护**
   - 不要将包含敏感信息的 `.env` 文件提交到版本控制系统
   - 使用 `.env.example` 作为模板，不包含实际的敏感信息
   - 生产环境的敏感信息（如数据库密码、API密钥）应通过安全的方式管理

2. **默认值安全**
   - 为所有配置提供安全的默认值
   - 确保默认值不会在生产环境中造成安全问题

3. **环境隔离**
   - 确保开发、测试和生产环境使用不同的资源（数据库、缓存等）
   - 测试环境不应使用生产数据

## 配置优先级

环境变量的优先级从高到低：

1. 运行时设置的环境变量（如 `PORT=4000 npm start`）
2. `.env.local` 文件中的变量
3. 特定环境文件（`.env.production`、`.env.test`）中的变量
4. `.env` 文件中的变量
5. 代码中的默认值 