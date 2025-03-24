# 飞儿云应用设计文档

## 项目概述

飞儿云是一个基于 DRYcore 框架开发的云服务平台,提供云服务器、域名管理、云空间、云数据库、云Web站点等服务。采用统一服务器端入口模式，所有用户请求先由服务端处理，根据域名返回相应的HTML页面，然后动态加载前端JS文件，实现集中式配置管理和多端应用支持。作为DRYcore框架的应用实例，飞儿云位于框架的apps目录下，复用框架的核心功能，同时实现自己的业务逻辑。

## 多端支持

飞儿云应用包含以下端：

1. **管理后台(admin)**
   - 域名：admin.feieryun.com
   - 用户：系统管理员、运维人员
   - 功能：系统配置、资源管理、用户管理、订单管理等

2. **用户前台(client)**
   - 域名：www.feieryun.com
   - 用户：普通用户、客户
   - 功能：服务购买、资源管理、账单查看、工单提交等

3. **合作伙伴端(partner)**
   - 域名：partner.feieryun.com
   - 用户：代理商、分销商
   - 功能：客户管理、订单管理、佣金查看、产品分销等

4. **员工端(staff)**
   - 域名：staff.feieryun.com
   - 用户：客服、销售等内部员工
   - 功能：工单处理、客户服务、销售管理等

5. **API端(api)**
   - 域名：api.feieryun.com
   - 用户：第三方开发者、系统集成商
   - 功能：提供API接口服务、系统集成等

## 技术架构

### 后端架构
- 框架：Node.js + Hono + TypeScript
- ORM：Drizzle
- 数据库：MySQL
- 构建工具：esbuild
- 代码生成：基于配置的代码生成器
- 配置管理：集中式配置管理
- 域名管理：多域名支持
- 路径别名：使用 `@/` 作为项目根目录别名

### 前端架构
- 框架：React + TypeScript
- UI组件：Ant Design
- 状态管理：Redux Toolkit
- 路由：React Router
- 构建工具：esbuild
- 路径别名：使用 `@/` 作为项目根目录别名
- 部署方式：服务端渲染 + 动态加载

## 功能模块

### 1. 云服务器管理
- 服务器列表
  - 基本信息展示
  - 状态监控
  - 操作管理
- 服务器创建
  - 配置选择
  - 系统选择
  - 网络配置
- 服务器操作
  - 开机/关机
  - 重启
  - 重装系统
  - 快照管理
- 监控告警
  - CPU使用率
  - 内存使用率
  - 磁盘使用率
  - 网络流量

### 2. 域名管理
- 域名列表
  - 域名信息
  - DNS记录
  - 解析状态
- 域名操作
  - 添加域名
  - 修改DNS
  - 域名解析
  - 域名过户
- 证书管理
  - SSL证书申请
  - 证书部署
  - 证书续期

### 3. 云空间
- 文件管理
  - 文件上传
  - 文件下载
  - 文件分享
  - 文件预览
- 存储管理
  - 空间统计
  - 流量统计
  - 存储类型
- 权限管理
  - 访问控制
  - 分享设置
  - 防盗链

### 4. 云数据库
- 数据库管理
  - 创建数据库
  - 数据库备份
  - 数据库恢复
- 用户管理
  - 创建用户
  - 权限设置
  - 密码管理
- 监控管理
  - 性能监控
  - 连接数监控
  - 慢查询分析

### 5. 云Web站点
- 站点管理
  - 站点创建
  - 站点配置
  - 站点备份
- 应用管理
  - 应用安装
  - 应用配置
  - 应用更新
- 域名绑定
  - 域名解析
  - SSL配置
  - 重定向设置

## 数据模型

### 1. 用户模型
```typescript
interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 服务器模型
```typescript
interface Server {
  id: string;
  name: string;
  userId: string;
  type: 'vps' | 'dedicated';
  status: 'running' | 'stopped' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  bandwidth: number;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. 域名模型
```typescript
interface Domain {
  id: string;
  name: string;
  userId: string;
  status: 'active' | 'pending' | 'error';
  dnsRecords: DNSRecord[];
  sslCertificates: SSLCertificate[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. 存储空间模型
```typescript
interface Storage {
  id: string;
  userId: string;
  type: 'file' | 'database' | 'backup';
  size: number;
  used: number;
  files: File[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. 数据库模型
```typescript
interface Database {
  id: string;
  userId: string;
  name: string;
  type: 'mysql' | 'postgresql';
  version: string;
  status: 'running' | 'stopped';
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 部署方案

### 1. 开发环境
- 本地开发服务器
- 热重载支持
- 调试工具
- 开发文档

### 2. 生产环境
- Docker容器化
- 负载均衡
- 监控告警
- 日志收集
- 域名配置
  - 管理后台：admin.feiyun.com
  - 用户前台：www.feiyun.com

## 安全方案

### 1. 用户安全
- 密码加密存储
- 双因素认证
- 登录日志
- 异常告警

### 2. 数据安全
- 数据加密
- 定期备份
- 访问控制
- 操作审计

### 3. 网络安全
- SSL加密
- DDoS防护
- WAF防护
- 防火墙

## 监控方案

### 1. 系统监控
- 服务器状态
- 资源使用
- 网络流量
- 错误日志

### 2. 业务监控
- 用户行为
- 业务指标
- 性能指标
- 异常告警

## 开发计划

### 第一阶段：基础架构
- 项目初始化
- 数据库设计
- 基础功能实现
- 用户系统

### 第二阶段：核心功能
- 云服务器管理
- 域名管理
- 云空间
- 云数据库

### 第三阶段：高级功能
- 云Web站点
- 监控系统
- 安全系统
- 计费系统

### 第四阶段：优化完善
- 性能优化
- 用户体验
- 文档完善
- 运维支持 