# 端到端测试

## 概述

端到端(E2E)测试验证整个应用从前端到后端的完整流程，模拟真实用户交互。DRYcore使用Playwright进行端到端测试，确保用户界面、API和数据库正确协作。

## 端到端测试目录结构

E2E测试位于项目根目录的`e2e`文件夹中：

```
e2e/
├── fixtures/         # 测试数据
├── helpers/          # 测试帮助函数
├── page-objects/     # 页面对象模型
├── specs/            # 测试规格
│   ├── auth/         # 认证相关测试
│   ├── users/        # 用户管理测试
│   └── ...
├── playwright.config.ts  # Playwright配置
└── global-setup.ts       # 全局测试设置
```

## 设置端到端测试环境

### 1. 安装依赖

```bash
pnpm add -D @playwright/test playwright
```

### 2. Playwright配置

创建`e2e/playwright.config.ts`:

```typescript
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './specs',
  timeout: 30 * 1000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  // 全局安装程序，启动测试服务器
  globalSetup: require.resolve('./global-setup'),
  webServer: {
    command: 'pnpm start:e2e',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
```

### 3. 全局设置

创建`e2e/global-setup.ts`:

```typescript
import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  // 重置测试数据库
  resetTestDatabase();
  
  // 预先登录并保存状态
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(`${baseURL}/auth/login`);
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'adminpassword');
  await page.click('button[type="submit"]');
  
  // 等待登录成功
  await page.waitForURL(`${baseURL}/dashboard`);
  
  // 保存登录状态
  await page.context().storageState({ path: './e2e/fixtures/adminState.json' });
  
  await browser.close();
  
  console.log('已设置E2E测试环境');
}

function resetTestDatabase() {
  try {
    // 重置测试数据库结构并填充测试数据
    execSync('pnpm prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
    execSync('pnpm db:seed:e2e', { stdio: 'inherit' });
    console.log('已重置测试数据库');
  } catch (error) {
    console.error('重置测试数据库失败:', error);
    process.exit(1);
  }
}

export default globalSetup;
```

### 4. 测试数据填充脚本

在`scripts/seed-e2e.ts`中创建E2E测试数据：

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 清理现有数据
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  
  // 创建管理员
  const adminPassword = await hash('adminpassword', 10);
  const admin = await prisma.user.create({
    data: {
      name: '管理员',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  
  // 创建普通用户
  const userPassword = await hash('userpassword', 10);
  const user = await prisma.user.create({
    data: {
      name: '测试用户',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });
  
  // 创建示例内容
  await prisma.post.createMany({
    data: [
      {
        title: '第一篇文章',
        content: '这是第一篇文章的内容。',
        published: true,
        authorId: user.id,
      },
      {
        title: '草稿文章',
        content: '这是一篇未发布的草稿。',
        published: false,
        authorId: user.id,
      },
    ],
  });
  
  console.log('已创建E2E测试数据');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 编写端到端测试

### 1. 页面对象模型(POM)

使用POM模式分离页面交互逻辑和测试逻辑：

```typescript
// e2e/page-objects/login.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="login-error"]');
  }
  
  async goto() {
    await this.page.goto('/auth/login');
  }
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
  
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// e2e/page-objects/users.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  readonly usersList: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.usersList = page.locator('[data-testid="users-list"]');
    this.createButton = page.locator('[data-testid="create-user-button"]');
    this.searchInput = page.locator('[data-testid="search-users"]');
  }
  
  async goto() {
    await this.page.goto('/admin/users');
  }
  
  async createUser(userData: { name: string, email: string, password: string, role: string }) {
    await this.createButton.click();
    await this.page.locator('[name="name"]').fill(userData.name);
    await this.page.locator('[name="email"]').fill(userData.email);
    await this.page.locator('[name="password"]').fill(userData.password);
    await this.page.locator(`[name="role"][value="${userData.role}"]`).check();
    await this.page.locator('button[type="submit"]').click();
  }
  
  async searchUser(query: string) {
    await this.searchInput.fill(query);
    // 等待搜索结果加载
    await this.page.waitForTimeout(500);
  }
  
  async expectUserInList(name: string, email: string) {
    const userRow = this.usersList.locator(`tr:has-text("${email}")`);
    await expect(userRow).toBeVisible();
    await expect(userRow.locator('td', { hasText: name })).toBeVisible();
  }
  
  async deleteUser(email: string) {
    const userRow = this.usersList.locator(`tr:has-text("${email}")`);
    await userRow.locator('[data-testid="delete-user-button"]').click();
    await this.page.locator('[data-testid="confirm-delete-button"]').click();
  }
}
```

### 2. 认证测试

```typescript
// e2e/specs/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login.page';

test.describe('登录功能', () => {
  test('成功登录', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login('user@example.com', 'userpassword');
    
    // 验证登录成功，重定向到仪表板
    await expect(page).toHaveURL(/.*dashboard/);
    
    // 验证导航栏显示已登录用户名
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('测试用户');
  });
  
  test('错误凭证登录失败', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login('user@example.com', 'wrongpassword');
    
    // 验证显示错误消息
    await loginPage.expectErrorMessage('邮箱或密码不正确');
    
    // 确认URL未改变
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('空字段验证', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    // 点击提交但不填写任何字段
    await loginPage.submitButton.click();
    
    // 验证表单验证错误
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });
});
```

### 3. 用户管理测试

```typescript
// e2e/specs/users/user-management.spec.ts
import { test, expect } from '@playwright/test';
import { UsersPage } from '../../page-objects/users.page';

test.describe('用户管理', () => {
  // 使用预登录的管理员状态
  test.use({ storageState: './e2e/fixtures/adminState.json' });
  
  test('管理员可以查看用户列表', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    
    // 验证用户列表存在并包含预设的用户
    await usersPage.expectUserInList('测试用户', 'user@example.com');
  });
  
  test('管理员可以创建新用户', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    
    const newUser = {
      name: '新创建用户',
      email: 'newuser@example.com',
      password: 'newpassword',
      role: 'USER',
    };
    
    await usersPage.createUser(newUser);
    
    // 验证成功提示
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 验证新用户已出现在列表中
    await usersPage.expectUserInList('新创建用户', 'newuser@example.com');
  });
  
  test('管理员可以搜索用户', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    
    // 搜索特定用户
    await usersPage.searchUser('测试用户');
    
    // 验证过滤结果
    await usersPage.expectUserInList('测试用户', 'user@example.com');
    
    // 不应该看到管理员
    const adminRow = usersPage.usersList.locator('tr:has-text("admin@example.com")');
    await expect(adminRow).toHaveCount(0);
  });
  
  test('管理员可以删除用户', async ({ page }) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    
    // 创建一个临时用户用于删除
    const tempUser = {
      name: '临时用户',
      email: 'temp@example.com',
      password: 'temppassword',
      role: 'USER',
    };
    
    await usersPage.createUser(tempUser);
    
    // 确认用户已创建
    await usersPage.expectUserInList('临时用户', 'temp@example.com');
    
    // 删除用户
    await usersPage.deleteUser('temp@example.com');
    
    // 验证成功提示
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 验证用户已从列表中移除
    const tempUserRow = usersPage.usersList.locator('tr:has-text("temp@example.com")');
    await expect(tempUserRow).toHaveCount(0);
  });
});
```

### 4. 完整流程测试

```typescript
// e2e/specs/flows/content-creation-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('内容创建流程', () => {
  // 使用预登录的普通用户状态
  test.beforeEach(async ({ page }) => {
    // 登录普通用户
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('用户可以创建、编辑和删除文章', async ({ page }) => {
    // 1. 导航到文章管理页面
    await page.click('text=我的文章');
    await expect(page).toHaveURL(/.*posts/);
    
    // 2. 创建新文章
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[name="title"]', '测试文章标题');
    await page.fill('[role="textbox"]', '这是测试文章的内容。');
    await page.click('[data-testid="publish-toggle"]');
    await page.click('button:has-text("保存")');
    
    // 3. 验证创建成功
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 4. 回到文章列表
    await page.click('text=返回列表');
    
    // 5. 验证文章出现在列表中
    await expect(page.locator('h3:has-text("测试文章标题")')).toBeVisible();
    
    // 6. 编辑文章
    await page.click('text=测试文章标题');
    await page.fill('[name="title"]', '更新后的标题');
    await page.click('button:has-text("保存")');
    
    // 7. 验证更新成功
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await page.click('text=返回列表');
    
    // 8. 验证更新后的标题出现在列表中
    await expect(page.locator('h3:has-text("更新后的标题")')).toBeVisible();
    
    // 9. 删除文章
    await page.click('text=更新后的标题');
    await page.click('[data-testid="delete-post-button"]');
    await page.click('[data-testid="confirm-delete-button"]');
    
    // 10. 验证删除成功
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 11. 验证文章已从列表中移除
    await expect(page.locator('h3:has-text("更新后的标题")')).toHaveCount(0);
  });
});
```

## 高级端到端测试功能

### 1. 视觉测试

```typescript
// e2e/specs/visual/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('视觉回归测试', () => {
  test('登录页面外观正确', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 检查页面外观
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02, // 允许2%的像素差异
    });
  });
  
  test('仪表板外观正确', async ({ page }) => {
    // 登录
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    
    // 等待仪表板加载完成
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 隐藏动态内容，如时间戳等
    await page.evaluate(() => {
      const timeElements = document.querySelectorAll('[data-testid="timestamp"]');
      timeElements.forEach(el => el.setAttribute('style', 'visibility: hidden'));
    });
    
    // 检查仪表板外观
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
```

### 2. 无障碍性测试

```typescript
// e2e/specs/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('无障碍测试', () => {
  test('登录页面符合无障碍标准', async ({ page }) => {
    await page.goto('/auth/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('仪表板符合无障碍标准', async ({ page }) => {
    // 登录
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    
    // 等待仪表板加载
    await page.waitForURL('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### 3. 性能测试

```typescript
// e2e/specs/performance/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    // 启用性能指标收集
    await page.goto('/');
    
    // 收集性能指标
    const metrics = await page.evaluate(() => JSON.stringify({
      // 首次内容绘制
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      // DOM完全加载
      DOMContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd,
      // 页面完全加载
      load: performance.getEntriesByType('navigation')[0]?.loadEventEnd,
    }));
    
    const parsedMetrics = JSON.parse(metrics);
    
    // 性能断言
    expect(parsedMetrics.FCP).toBeLessThan(1000); // 首次内容绘制应小于1秒
    expect(parsedMetrics.DOMContentLoaded).toBeLessThan(2000); // DOM加载应小于2秒
    expect(parsedMetrics.load).toBeLessThan(3000); // 页面完全加载应小于3秒
  });
  
  test('API响应性能', async ({ page, request }) => {
    // 登录获取token
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // 获取token
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    
    // 开始计时
    const startTime = Date.now();
    
    // 发送API请求
    const response = await request.get('/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // 计算响应时间
    const responseTime = Date.now() - startTime;
    
    // 验证响应状态和时间
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(1000); // API响应应小于1秒
  });
});
```

## 运行端到端测试

```bash
# 运行所有E2E测试
pnpm test:e2e

# 运行特定测试
pnpm test:e2e -- --grep "登录功能"

# 在特定浏览器中运行
pnpm test:e2e -- --project=firefox

# 使用UI模式调试测试
pnpm test:e2e -- --ui
```

## 端到端测试最佳实践

1. **专注于用户流程** - 测试真实用户会执行的完整业务流程
2. **保持测试独立** - 每个测试应该彼此隔离，不依赖其他测试
3. **使用页面对象模型** - 将页面交互细节与测试逻辑分离
4. **考虑不同设备和浏览器** - 在多种环境中测试以确保兼容性
5. **监控测试速度** - 保持E2E测试的高效执行，避免不必要的等待
6. **检查可访问性** - 确保应用符合无障碍标准
7. **在CI/CD流程中集成** - 作为部署流程的一部分自动运行E2E测试

## 示例：完整登录流程测试

```typescript
// e2e/specs/flows/authentication-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test('完整注册和登录流程', async ({ page }) => {
    // 1. 打开注册页面
    await page.goto('/auth/register');
    
    // 生成唯一邮箱，避免测试冲突
    const uniqueId = Date.now().toString();
    const email = `user-${uniqueId}@example.com`;
    
    // 2. 填写注册表单
    await page.fill('[name="name"]', '新注册用户');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="passwordConfirm"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 3. 验证注册成功并重定向到仪表板
    await expect(page).toHaveURL(/.*dashboard/);
    
    // 4. 登出
    await page.click('[data-testid="user-menu"]');
    await page.click('text=登出');
    
    // 5. 验证已登出并回到首页
    await expect(page).toHaveURL(/.*login/);
    
    // 6. 使用新创建的账号登录
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 7. 验证登录成功
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('新注册用户');
    
    // 8. 验证用户特定内容显示
    await expect(page.locator('text=欢迎，新注册用户')).toBeVisible();
  });
  
  test('用户无法访问受限内容', async ({ page }) => {
    // 1. 尝试直接访问管理员页面
    await page.goto('/admin/users');
    
    // 2. 验证被重定向到登录页面
    await expect(page).toHaveURL(/.*login/);
    
    // 3. 登录普通用户
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'userpassword');
    await page.click('button[type="submit"]');
    
    // 4. 再次尝试访问管理员页面
    await page.goto('/admin/users');
    
    // 5. 验证显示访问被拒绝
    await expect(page.locator('text=无权访问')).toBeVisible();
  });
});
```

## 小结

端到端测试是DRYcore测试策略的最外层，它从用户角度验证整个应用的正确运行。虽然E2E测试运行较慢，但它们提供了最真实的应用功能验证。通过结合单元测试、集成测试和端到端测试，DRYcore能够在各个层次保证应用的质量和稳定性。 