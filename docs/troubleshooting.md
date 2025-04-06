# DRYcore框架常见问题排查指南

> 更新日期: 2025年3月30日

本文档记录了DRYcore框架开发过程中遇到的常见问题及其解决方案，方便开发者快速排查和解决问题。

## 目录

- [依赖管理问题](#依赖管理问题)
- [TypeScript编译错误](#typescript编译错误)
- [构建错误](#构建错误)
- [运行时错误](#运行时错误)

## 依赖管理问题

### 1. pnpm递归调用死循环

**症状**:
```
> drycore@1.0.0 dev C:\Users\xixi\Desktop\DRYcore
> pnpm run dev --filter @drycore/server

> drycore@1.0.0 dev C:\Users\xixi\Desktop\DRYcore
> pnpm run dev --filter @drycore/server "--filter" "@drycore/server"

...无限循环
```

**原因**:
根目录的`package.json`脚本配置使用了导致递归的格式：`pnpm run xxx --filter=xxx`

**解决方案**:
修改脚本格式为：`pnpm --filter=xxx xxx`

```json
// 错误
"dev": "pnpm run dev --filter @drycore/server"

// 正确
"dev": "pnpm --filter @drycore/server dev"
```

### 2. npm包不存在

**症状**:
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/esbuild-plugin-react: Not Found - 404
```

**原因**:
package.json中引用了不存在的npm包

**解决方案**:
1. 搜索正确的包名或使用替代包
2. 如果没有替代包，移除对该包的依赖并使用其他方式实现相同功能

### 3. 包管理器混用

**症状**:
```
WARN  Moving @typescript-eslint/eslint-plugin that was installed by a different package manager to "node_modules/.ignored"
```

**解决方案**:
1. 删除所有node_modules目录: `rm -rf node_modules packages/*/node_modules`
2. 删除所有锁文件: `rm -rf package-lock.json yarn.lock pnpm-lock.yaml`
3. 使用.npmrc强制使用pnpm
4. 重新安装依赖: `pnpm install`

## TypeScript编译错误

### 1. 找不到模块

**症状**:
```
TSError: ⨯ Unable to compile TypeScript:
src/index.ts:7:33 - error TS2307: Cannot find module './middlewares/error' or its corresponding type declarations.
```

**原因**:
1. 对应文件不存在
2. tsconfig.json中路径别名配置错误
3. 导入路径错误

**解决方案**:
1. 创建缺少的文件
2. 检查并修复tsconfig.json中的路径别名配置
3. 修正导入路径

### 2. 类型不匹配

**症状**:
```
error TS2769: No overload matches this call.
```

**原因**:
函数调用的参数类型与函数定义的参数类型不匹配

**解决方案**:
1. 修正函数参数类型
2. 更新函数定义
3. 使用类型断言

## 构建错误

### 1. ESBuild插件错误

**症状**:
```
[esbuild] Error: Plugin "xxx" returned a value that wasn't an object
```

**原因**:
ESBuild插件配置错误或插件不兼容

**解决方案**:
1. 检查插件使用方式
2. 更新插件版本
3. 寻找替代插件

## 运行时错误

### 1. 路由未找到

**症状**:
```
Error: Route "/api/xxx" not found
```

**原因**:
1. 路由未注册
2. 应用未正确加载

**解决方案**:
1. 检查路由配置
2. 确保应用正确注册
3. 检查应用加载过程中的错误

### 2. 配置读取错误

**症状**:
```
Error: Configuration "xxx" not found for app "yyy"
```

**原因**:
1. 配置未注册
2. 使用了错误的应用名称或配置键

**解决方案**:
1. 确保配置正确注册
2. 检查应用名称和配置键

## 最佳实践

### 开发前检查

1. **依赖正确性检查**: 确保所有依赖包名正确且存在
2. **模块路径检查**: 确保导入路径正确
3. **文档阅读**: 查看相关文档了解正确用法

### 错误排查流程

1. **查阅文档**: 首先查看本文档是否已记录相同问题
2. **日志分析**: 仔细阅读错误日志，识别错误类型
3. **定位问题**: 根据错误信息定位问题源
4. **尝试解决**: 应用对应解决方案
5. **记录问题**: 解决后，更新本文档

## 贡献指南

如果你遇到新的问题并解决了，请将其记录到本文档，包括:

1. 问题症状
2. 问题原因
3. 解决方案
4. 更新日期

请记住始终包含文档更新日期，方便追踪文档的时效性。 