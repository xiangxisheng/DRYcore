# 代码规范与Linting配置

## 代码规范工具

DRYcore 使用 ESLint 和 Prettier 来确保代码质量和一致性。这些工具帮助我们自动执行代码规范检查并在可能的情况下自动修复问题。

## ESLint 配置

项目的根目录下有一个 `.eslintrc.js` 文件，其中包含项目的 ESLint 配置。

```javascript
module.exports = {
  root: true,
  plugins: ['import'],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    // 禁止使用相对父路径导入
    'import/no-relative-parent-imports': 'error',
    
    // 强制使用路径别名
    'import/no-unresolved': 'error',
    
    // 确保导入顺序一致
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
      },
    ],
  },
  // ... 更多配置
};
```

## 关键规则说明

本项目中有一些非常重要的规则，必须遵守：

1. **禁止使用相对父路径导入** (`import/no-relative-parent-imports`)
   - 禁止使用包含 `../` 的导入路径
   - 要求使用路径别名替代相对路径
   - 示例：
     ```typescript
     // ❌ 错误：使用相对父路径
     import { User } from '../../../types/user';
     
     // ✅ 正确：使用路径别名
     import { User } from '@/types/user';
     ```

2. **导入顺序** (`import/order`)
   - 要求按特定顺序组织 import 语句
   - 顺序为：内置模块 → 外部依赖 → 内部模块（@/） → 相对路径
   - 各组之间需要空行分隔
   - 示例：
     ```typescript
     // 内置模块
     import fs from 'fs';
     import path from 'path';
     
     // 外部依赖
     import { Hono } from 'hono';
     import React from 'react';
     
     // 内部模块（使用路径别名）
     import { User } from '@/types/user';
     import { getConfig } from '@/config/app';
     
     // 相对路径（同级或子级）
     import { Button } from './Button';
     import styles from './styles.module.css';
     ```

3. **类型安全** (`@typescript-eslint/no-explicit-any`)
   - 尽量避免使用 `any` 类型
   - 使用适当的接口或类型别名代替

## 自动修复

您可以使用以下命令自动修复可以修复的问题：

```bash
# 修复所有包
pnpm run lint --fix

# 修复特定包
pnpm run lint --filter @drycore/web --fix
```

## IDE 集成

强烈建议在您的 IDE 中配置 ESLint，以获得实时的错误提示和自动修复功能。

### VS Code

在 VS Code 中，安装 ESLint 扩展并将以下配置添加到您的 `settings.json` 文件：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### WebStorm / IntelliJ IDEA

在 WebStorm 或 IntelliJ IDEA 中：

1. 转到 `Preferences/Settings` → `Languages & Frameworks` → `JavaScript` → `Code Quality Tools` → `ESLint`
2. 勾选 `Automatic ESLint configuration`
3. 勾选 `Run eslint --fix on save`

## Git Hooks

我们使用 husky 和 lint-staged 确保提交到仓库的代码符合规范：

```json
// package.json 片段
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

## 路径别名检查脚本

为确保没有遗漏的相对路径导入，可以在CI管道中运行以下脚本：

```bash
#!/bin/bash
# 检查是否存在相对父路径导入
FOUND=$(grep -r --include="*.ts" --include="*.tsx" "from '\.\.\/" packages/)
if [ -n "$FOUND" ]; then
  echo "发现相对父路径导入，请改用路径别名:"
  echo "$FOUND"
  exit 1
fi
```

## 总结

我们的代码规范和linting工具旨在帮助开发者遵循项目的最佳实践，特别是避免使用相对父路径导入。请确保您的代码在提交前满足这些规范。 