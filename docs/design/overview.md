# DRYcore 设计文档

## 项目愿景

DRYcore 是一个基于"Don't Repeat Yourself"原则的全栈开发框架，旨在通过配置驱动开发的方式，实现零重复代码的目标。通过定义数据模型和系统行为，自动生成前后端代码，提高开发效率，降低维护成本。采用统一服务器端入口模式，所有用户请求先由服务端处理，根据域名返回相应的HTML页面，然后动态加载前端JS文件，实现集中式配置管理和多端应用支持。

## 技术架构

### 后端架构
- 框架：Node.js + Hono + TypeScript
- ORM：Drizzle
- 数据库：PostgreSQL
- 构建工具：esbuild
- 代码生成：基于配置的代码生成器
- 配置管理：集中式配置管理
  - 所有配置统一在服务端管理
  - 前端通过服务端接口获取配置
  - 支持多环境配置
- 域名管理：
  - 支持多域名绑定
  - 基于域名的路由分发
  - 支持子域名配置
- 多应用支持：
  - 单一服务器实例支持多个应用
  - 通过域名区分不同应用
  - 共享核心功能，减少代码重复
  - 应用独立开发，互不干扰
  - 每个应用支持多种端类型：
    - 管理后台(admin)：系统管理员使用
    - 用户前台(client)：普通用户使用
    - 合作伙伴端(partner)：代理商、分销商使用
    - 员工端(staff)：内部员工操作界面
    - API端(api)：为第三方集成提供接口
    - 及其他自定义端类型
- 路径别名：使用 `@/` 作为项目根目录别名

### 前端架构
- 框架：React + TypeScript
- UI组件：Ant Design
- 状态管理：Redux Toolkit
- 路由：React Router
- 构建工具：esbuild
- 路径别名：使用 `@/` 作为项目根目录别名
- 部署方式：
  - 统一由服务端提供HTML页面
  - 页面中包含服务端配置
  - 动态加载前端JS文件
  - 支持多端适配
- 多端支持：
  - Web端：React + Ant Design
  - 移动端：React Native + Ant Design Mobile
  - 桌面端：Electron + React
  - 小程序：Taro + React

### 开发工具
- 包管理：pnpm
- 代码规范：ESLint + Prettier
- 类型检查：TypeScript
- 构建工具：esbuild
- 测试框架：Jest
- 路径别名：tsconfig.json 配置

## 目录结构

```
drycore/
├── packages/
│   ├── server/           # 后端服务
│   │   ├── src/
│   │   │   ├── core/     # 核心公共功能
│   │   │   │   ├── controllers/  # 通用控制器
│   │   │   │   ├── services/     # 通用服务
│   │   │   │   ├── routes/       # 通用路由
│   │   │   │   └── middlewares/  # 通用中间件
│   │   │   ├── config/   # 配置文件
│   │   │   │   ├── domain.ts    # 域名配置
│   │   │   │   └── index.ts     # 系统配置
│   │   │   ├── utils/    # 工具函数
│   │   │   └── apps/     # 应用目录
│   │   │       ├── feieryun/     # 飞儿云应用
│   │   │       │   ├── admin/    # 管理后台相关
│   │   │       │   ├── client/   # 用户前台相关
│   │   │       │   ├── partner/  # 合作伙伴端相关
│   │   │       │   ├── staff/    # 员工端相关
│   │   │       │   ├── api/      # API端相关
│   │   │       │   ├── shared/   # 应用内共享代码
│   │   │       │   └── docs/     # 应用文档
│   │   │       └── other-app/    # 其他应用
│   │   └── scripts/      # 构建脚本
│   ├── web/             # Web前端
│   │   ├── src/
│   │   │   ├── admin/   # 管理后台
│   │   │   ├── client/  # 用户前台
│   │   │   ├── shared/  # 共享组件
│   │   │   └── utils/   # 工具函数
│   │   └── scripts/     # 构建脚本
│   ├── mobile/          # 移动端
│   ├── desktop/         # 桌面端
│   └── miniapp/         # 小程序
├── docs/                # 框架通用文档
└── scripts/            # 项目脚本
```

## 应用文档位置

每个应用的详细文档都放置在应用自己的目录中：

```
packages/server/src/apps/{应用名}/docs/design.md
```

例如，飞儿云应用的文档位于：
```
packages/server/src/apps/feieryun/docs/design.md
```

这样组织文档可以让开发人员先了解框架整体设计，再查看具体应用的详细文档，更加清晰地理解需要实现的功能。

## 核心特性

1. 配置驱动开发
   - 通过配置文件定义数据模型
   - 自动生成 CRUD 接口
   - 自动生成前端页面
   - 自动生成权限控制

2. 零重复代码
   - 核心功能与应用功能分离
   - 公共控制器、服务、路由复用
   - 应用特定逻辑独立实现
   - 共享组件库和工具函数
   - 共享业务逻辑
   - 集中式配置管理

3. 多端支持
   - Web端：完整的管理后台和用户前台
   - 移动端：用户前台
   - 桌面端：完整的管理后台和用户前台
   - 小程序：用户前台

4. 权限管理
   - 基于角色的访问控制
   - 细粒度的权限控制
   - 动态菜单生成
   - 动态路由控制

## 工作流程

1. 定义数据模型
   - 使用 Prisma Schema 定义模型
   - 配置模型关系和验证规则
   - 生成 Drizzle Schema

2. 配置系统行为
   - 定义菜单结构
   - 配置权限规则
   - 设置业务规则
   - 配置UI主题
   - 配置域名绑定

3. 生成代码
   - 生成后端API
   - 生成前端页面
   - 生成权限控制
   - 生成类型定义

4. 开发业务逻辑
   - 实现自定义业务逻辑
   - 添加自定义组件
   - 配置自定义路由
   - 设置自定义权限

5. 应用加载与域名路由
   - 服务器启动时扫描apps目录加载应用
   - 读取domain.ts中的域名映射配置
   - 根据请求域名动态路由到对应应用
   - 支持多种端类型（管理后台、用户前台、合作伙伴、员工端等）
   ```typescript
   // domain.ts示例
   export const domainConfig = {
     // 飞儿云应用
     'admin.feieryun.com': { app: 'feieryun', type: 'admin' },
     'www.feieryun.com': { app: 'feieryun', type: 'client' },
     'partner.feieryun.com': { app: 'feieryun', type: 'partner' },
     'staff.feieryun.com': { app: 'feieryun', type: 'staff' },
     'api.feieryun.com': { app: 'feieryun', type: 'api' },
     
     // 其他应用
     'admin.other-app.com': { app: 'other-app', type: 'admin' },
     'www.other-app.com': { app: 'other-app', type: 'client' }
   };
   ```

## 部署方案

1. 开发环境
   - 本地开发服务器
   - 热重载支持
   - 调试工具
   - 开发文档

2. 生产环境
   - Docker容器化
   - 负载均衡
   - 监控告警
   - 日志收集
   - 域名配置
     - 管理后台：admin.example.com
     - 用户前台：www.example.com

## 前端部署流程

1. 构建流程
   - 前端统一模块打包为JS文件库
   - 服务端生成HTML页面
   - 注入服务端配置
   - 引用必要的前端JS模块

2. 访问流程
   - 用户访问域名
   - 服务端根据域名返回对应HTML
   - 页面加载服务端配置
   - 按需动态加载前端模块
   - 根据配置组装UI组件
   - 渲染页面内容

3. 配置管理
   - 服务端统一管理配置
   - 根据域名过滤配置
   - 动态注入页面
   - 支持配置热更新
   - 前端按配置动态加载模块

## 开发规范

1. 代码规范
   - ESLint配置
   - Prettier配置
   - TypeScript配置
   - Git提交规范

2. 文档规范
   - API文档
   - 组件文档
   - 开发文档
   - 部署文档

3. 测试规范
   - 单元测试
   - 集成测试
   - E2E测试
   - 性能测试

## 后续规划

1. **功能增强**
   - 更多前端框架支持
   - 更丰富的组件库
   - 更强大的后端代码生成
   - 更智能的前端模块加载机制

2. **性能优化**
   - 构建优化
   - 代码拆分
   - 动态导入
   - 资源预加载

3. **开发体验**
   - 更好的调试工具
   - 更完善的文档
   - 更简单的配置
   - 前端组件开发工具 