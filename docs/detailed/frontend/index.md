# 前端开发指南

## 概述

DRYcore前端架构采用现代化的组件设计，基于React和TypeScript构建，支持多平台部署。本文档提供了前端开发的详细指南，包括架构设计、组件开发、状态管理、路由配置、样式管理和性能优化等方面。

## 目录

- [架构概览](./architecture.md) - 前端架构设计与技术栈
- [组件开发](./components.md) - 组件设计、开发与最佳实践
- [状态管理](./state-management.md) - 全局状态与本地状态管理策略
- [路由管理](./routing.md) - 应用路由配置与权限控制
- [样式管理](./styling.md) - CSS组织、主题系统与响应式设计
- [数据获取](./data-fetching.md) - API调用、缓存与错误处理
- [表单处理](./forms.md) - 表单设计、验证与提交
- [国际化](./i18n.md) - 多语言支持与本地化
- [性能优化](./performance.md) - 性能测量、优化技巧与最佳实践
- [测试策略](./testing.md) - 组件测试、端到端测试与测试最佳实践
- [构建部署](./build-deploy.md) - 构建配置、环境变量与部署流程

## 前端技术栈

DRYcore前端采用以下核心技术：

- **React** - 用户界面库
- **TypeScript** - 类型安全的JavaScript超集
- **React Router** - 路由管理
- **Zustand/Redux Toolkit** - 状态管理
- **React Query** - 数据获取与缓存
- **Tailwind CSS** - 实用优先的CSS框架
- **Vite** - 开发环境与构建工具
- **Vitest/Jest** - 单元测试
- **Playwright** - 端到端测试
- **Storybook** - 组件开发与文档

## 快速入门

### 前端开发环境设置

1. 确保已安装Node.js (v16.0.0+)和PNPM (v8.0.0+)
2. 克隆项目并安装依赖：

```bash
# 克隆项目
git clone https://github.com/yourusername/drycore.git
cd drycore

# 安装依赖
pnpm install
```

3. 启动开发服务器：

```bash
# 启动前端开发服务器
pnpm dev:web
```

### 创建新组件

在DRYcore中创建新组件的基本步骤：

1. 在适当的目录下创建组件文件：

```tsx
// packages/web/src/components/Button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded font-medium transition-colors',
        {
          // Variants
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'border border-primary-600 text-primary-600 hover:bg-primary-50': variant === 'outline',
          'text-primary-600 hover:bg-primary-50': variant === 'ghost',
          
          // Sizes
          'text-sm px-3 py-1': size === 'sm',
          'px-4 py-2': size === 'md',
          'text-lg px-5 py-2.5': size === 'lg',
          
          // States
          'opacity-70 cursor-not-allowed': isLoading || disabled,
        },
        className
      )}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
```

2. 创建组件的索引文件：

```tsx
// packages/web/src/components/Button/index.ts
export * from './Button';
```

3. 为组件编写测试：

```tsx
// packages/web/src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  test('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  test('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  
  test('disables button when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  test('renders with leftIcon and rightIcon', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Click me
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
```

### 组件使用示例

以下是如何在应用中使用自定义组件的示例：

```tsx
import { Button } from '@/components/Button';
import { FiSave, FiTrash } from 'react-icons/fi';

function UserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 保存用户数据...
      await saveUserData();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <div className="flex gap-4 mt-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<FiSave />}
        >
          保存
        </Button>
        
        <Button
          type="button"
          variant="outline"
          leftIcon={<FiTrash />}
          onClick={handleReset}
        >
          重置
        </Button>
      </div>
    </form>
  );
}
```

## 目录结构

DRYcore前端代码遵循以下目录结构：

```
packages/web/
├── public/          # 静态资源
├── src/
│   ├── app/         # 应用入口
│   ├── assets/      # 图片、字体等资源
│   ├── components/  # 可复用UI组件
│   ├── config/      # 应用配置
│   ├── contexts/    # React上下文
│   ├── features/    # 按功能组织的模块
│   ├── hooks/       # 自定义React Hooks
│   ├── layouts/     # 页面布局组件
│   ├── lib/         # 工具库和辅助函数
│   ├── pages/       # 页面组件
│   ├── router/      # 路由配置
│   ├── services/    # API服务
│   ├── store/       # 状态管理
│   ├── styles/      # 全局样式
│   ├── types/       # TypeScript类型定义
│   └── utils/       # 通用工具函数
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 开发规范

### 命名约定

- **组件**: 使用PascalCase (如`Button.tsx`, `UserList.tsx`)
- **非组件文件**: 使用kebab-case (如`api-client.ts`, `use-auth.ts`)
- **常量**: 使用UPPER_SNAKE_CASE (如`API_URL`, `MAX_FILE_SIZE`)
- **变量和函数**: 使用camelCase (如`userData`, `fetchUsers`)

### 代码风格

DRYcore前端代码遵循以下代码风格规范：

- 使用ESLint和Prettier保持代码风格一致
- 优先使用函数组件和React Hooks
- 使用TypeScript类型确保类型安全
- 组件文件中优先导出命名组件而非默认导出
- 避免过度使用内联样式，优先使用Tailwind类名

## 组件设计原则

DRYcore前端组件遵循以下设计原则：

1. **单一职责**: 每个组件应专注于完成单一功能
2. **可组合性**: 组件应设计为可以轻松组合和嵌套
3. **可扩展性**: 通过props提供扩展点，允许组件被定制
4. **自包含**: 组件应包含所需的所有逻辑和样式
5. **可测试性**: 组件应易于测试，避免过度复杂的内部状态

## 状态管理策略

DRYcore前端采用分层状态管理策略：

1. **本地状态**: 使用`useState`和`useReducer`管理组件内部状态
2. **共享状态**: 使用React Context或Zustand存储共享状态
3. **服务器状态**: 使用React Query管理API数据获取、缓存和同步
4. **URL状态**: 将部分应用状态存储在URL参数中
5. **持久化状态**: 使用localStorage/sessionStorage存储需要在会话间保留的状态

## 性能优化提示

提高DRYcore前端应用性能的关键技巧：

1. **组件懒加载**: 使用`React.lazy`和`Suspense`延迟加载组件
2. **代码分割**: 将应用分割成更小的代码块，按需加载
3. **虚拟列表**: 对长列表使用虚拟化技术，只渲染可见项
4. **优化渲染**: 使用`React.memo`、`useMemo`和`useCallback`避免不必要的渲染
5. **图片优化**: 使用适当的图片格式，实现响应式图片加载
6. **优先渲染内容**: 确保重要内容优先渲染，提升感知性能

## 贡献指南

### 组件开发流程

1. **讨论设计**: 在开始编码前，讨论组件的设计和API
2. **开发组件**: 在本地开发并测试组件
3. **编写文档**: 编写组件文档和使用示例
4. **编写测试**: 为组件编写单元测试和集成测试
5. **代码审查**: 提交PR并接受代码审查
6. **合并发布**: 合并PR并发布更新的包

### 测试要求

所有前端代码都应包含以下测试：

1. **单元测试**: 测试独立组件和函数
2. **集成测试**: 测试组件之间的交互
3. **端到端测试**: 测试关键用户流程

## 常见问题解答

### Q: 如何处理环境特定的配置?

A: 根据DRYcore的"统一服务器端入口模式"设计原则，前端配置由服务端统一管理和注入：

```typescript
// config.ts
export function getConfig<T>(key: string, defaultValue?: T): T {
  if (typeof window === 'undefined' || !window.__APP_CONFIG__) {
    return defaultValue as T;
  }
  return window.__APP_CONFIG__[key] ?? defaultValue;
}

export const config = {
  // 从服务端注入的全局配置中获取API URL
  apiUrl: getConfig('apiUrl', ''),
  environment: getConfig('environment', 'development'),
  isProduction: getConfig('environment', '') === 'production',
  isDevelopment: getConfig('environment', '') === 'development',
};
```

服务端在生成HTML页面时会注入配置：

```html
<!-- 服务端生成的HTML示例 -->
<script>
window.__APP_CONFIG__ = {
  apiUrl: "https://api.example.com",
  environment: "production",
  appName: "feieryun",
  appType: "admin"
  // 其他配置...
};
</script>
```

API客户端使用服务端注入的配置：

```typescript
// api-client.ts
import { getConfig } from '@/utils/config';

export function createApiClient() {
  const apiUrl = getConfig('apiUrl', '');
  return axios.create({
    baseURL: apiUrl,
    // 其他配置...
  });
}
```

### Q: 如何实现权限控制?

A: 使用基于角色的访问控制组件：

```tsx
import { useAuth } from '@/hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  
  // 检查用户是否有权限
  const hasPermission = user && roles.some(role => user.roles.includes(role));
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

使用示例：

```tsx
<RoleGuard roles={['ADMIN']} fallback={<AccessDenied />}>
  <AdminPanel />
</RoleGuard>
```

## 相关资源

- [React 官方文档](https://reactjs.org/docs/getting-started.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vite 文档](https://vitejs.dev/guide/)
- [React Query 文档](https://tanstack.com/query/latest) 