# 路径别名配置

## 功能说明

DRYcore 使用 TypeScript 路径别名来简化导入路径，提高代码可维护性。通过配置路径别名，我们可以避免使用复杂的相对路径，使代码更加清晰和易于维护。

## 配置步骤

### 1. TypeScript 配置

在 `tsconfig.json` 中添加路径别名配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@server/*": ["src/server/*"],
      "@client/*": ["src/client/*"],
      "@api/*": ["src/api/*"],
      "@types/*": ["src/types/*"],
      "@generators/*": ["src/generators/*"]
    }
  }
}
```

### 2. 运行时路径映射

创建 `src/config/paths.ts` 文件：

```typescript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const paths = {
  root: join(__dirname, '..', '..'),
  src: join(__dirname, '..'),
  server: join(__dirname, '..', 'server'),
  client: join(__dirname, '..', 'client'),
  api: join(__dirname, '..', 'api'),
  types: join(__dirname, '..', 'types'),
  generators: join(__dirname, '..', 'generators'),
  prisma: join(__dirname, '..', '..', 'prisma'),
  drizzle: join(__dirname, '..', '..', 'drizzle'),
} as const;
```

### 3. 构建工具配置

如果使用 esbuild，需要在构建配置中添加路径别名支持：

```typescript
import { build } from 'esbuild';
import { paths } from '@config/paths';

await build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  alias: {
    '@': paths.src,
    '@server': paths.server,
    '@client': paths.client,
    '@api': paths.api,
    '@types': paths.types,
    '@generators': paths.generators,
  },
});
```

## 使用示例

### 1. 导入模块

```typescript
// 之前的写法
import { User } from '../../../types/user';

// 使用路径别名
import { User } from '@types/user';
```

### 2. 使用路径映射

```typescript
import { paths } from '@config/paths';

// 获取配置文件路径
const configPath = join(paths.config, 'app.config.ts');

// 获取生成的代码路径
const generatedPath = join(paths.drizzle, 'generated');
```

## 最佳实践

1. **命名规范**
   - 使用 `@` 作为根路径别名
   - 使用模块名作为子路径别名
   - 保持命名简洁明了

2. **路径组织**
   - 按功能模块组织路径
   - 避免过深的目录结构
   - 保持路径结构清晰

3. **类型支持**
   - 确保路径别名有正确的类型定义
   - 使用 TypeScript 的路径映射功能
   - 保持类型检查的完整性

4. **构建优化**
   - 配置构建工具的路径别名支持
   - 确保开发和生产环境的一致性
   - 优化构建性能

## 常见问题

1. **路径解析失败**
   - 检查 `tsconfig.json` 配置
   - 确保路径别名正确映射
   - 验证构建工具配置

2. **类型错误**
   - 更新 TypeScript 配置
   - 检查类型定义文件
   - 确保 IDE 支持

3. **构建错误**
   - 验证构建工具配置
   - 检查路径映射
   - 确保依赖正确安装 