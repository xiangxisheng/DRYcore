# 多端适配

## 概述

DRYcore 框架提供了完整的多端适配解决方案，使应用能够在不同的平台（Web、移动端、桌面端、小程序）和不同的终端类型（管理后台、用户前台、合作伙伴端、员工端等）上一致运行。多端适配基于检测工具和响应式设计，实现代码共享和体验一致性。

## 支持的平台

DRYcore 支持以下平台：

- **Web端**：基于React + Ant Design的标准Web应用
- **移动端**：基于React Native + Ant Design Mobile的原生移动应用
- **桌面端**：基于Electron + React的跨平台桌面应用
- **小程序**：基于Taro + React的微信/支付宝小程序

## 终端类型

每个应用可以拥有多种终端类型：

- **管理后台 (admin)**：供系统管理员使用的管理界面
- **用户前台 (client)**：面向普通用户的应用界面
- **合作伙伴端 (partner)**：供合作伙伴、代理商使用的界面
- **员工端 (staff)**：内部员工使用的操作界面
- **API端 (api)**：对外提供的API接口

## 平台检测工具

DRYcore 使用 `platform.ts` 工具检测当前运行环境：

```typescript
/**
 * 平台检测工具
 * 用于在不同的运行环境中检测当前平台
 */

// 平台类型
export enum Platform {
  Web = 'web',
  Mobile = 'mobile',
  Desktop = 'desktop',
  MiniApp = 'miniapp',
  Unknown = 'unknown'
}

// 终端类型
export enum EndpointType {
  Admin = 'admin',
  Client = 'client',
  Partner = 'partner',
  Staff = 'staff',
  Api = 'api',
  Unknown = 'unknown'
}

/**
 * 检测当前平台
 * @returns 当前运行的平台类型
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return Platform.Unknown;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // 检测是否为小程序环境
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    return Platform.MiniApp;
  }

  // 检测是否为Electron桌面应用
  if (userAgent.indexOf('electron') > -1) {
    return Platform.Desktop;
  }

  // 检测是否为移动设备
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return Platform.Mobile;
  }

  // 默认为Web平台
  return Platform.Web;
}

/**
 * 检测当前终端类型
 * @returns 当前终端类型
 */
export function detectEndpointType(): EndpointType {
  if (typeof window === 'undefined') {
    return EndpointType.Unknown;
  }

  const hostname = window.location.hostname;

  if (hostname.startsWith('admin.')) {
    return EndpointType.Admin;
  }

  if (hostname.startsWith('partner.')) {
    return EndpointType.Partner;
  }

  if (hostname.startsWith('staff.')) {
    return EndpointType.Staff;
  }

  if (hostname.startsWith('api.')) {
    return EndpointType.Api;
  }

  // 默认为用户前台
  return EndpointType.Client;
}

/**
 * 获取当前平台和终端信息
 */
export function getPlatformInfo() {
  return {
    platform: detectPlatform(),
    endpoint: detectEndpointType()
  };
}
```

## 自适应布局组件

`AppLayout` 组件根据检测到的平台和终端类型提供相应的布局：

```tsx
import React from 'react';
import { getPlatformInfo, Platform, EndpointType } from '../../utils/platform';

// 定义布局属性接口
interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * 应用布局组件
 * 根据不同平台和终端类型加载不同的布局
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { platform, endpoint } = getPlatformInfo();

  // 根据平台类型渲染不同的布局
  const renderPlatformLayout = () => {
    switch (platform) {
      case Platform.Mobile:
        return (
          <div className="mobile-layout">
            <header className="mobile-header">
              <h1>DRYcore 移动端</h1>
            </header>
            <main className="mobile-content">{children}</main>
            <footer className="mobile-footer">
              <nav className="mobile-nav">
                <button>首页</button>
                <button>分类</button>
                <button>我的</button>
              </nav>
            </footer>
          </div>
        );

      case Platform.Desktop:
        return (
          <div className="desktop-layout">
            <header className="desktop-header">
              <h1>DRYcore 桌面端</h1>
            </header>
            <div className="desktop-container">
              <aside className="desktop-sidebar">
                <nav className="desktop-nav">
                  <ul>
                    <li>首页</li>
                    <li>应用</li>
                    <li>设置</li>
                  </ul>
                </nav>
              </aside>
              <main className="desktop-content">{children}</main>
            </div>
            <footer className="desktop-footer">
              <p>DRYcore © {new Date().getFullYear()}</p>
            </footer>
          </div>
        );

      default:
        // Web平台默认布局
        return renderEndpointLayout();
    }
  };

  // 根据终端类型渲染不同的布局
  const renderEndpointLayout = () => {
    switch (endpoint) {
      case EndpointType.Admin:
        return (
          <div className="admin-layout">
            {/* 管理后台布局 */}
          </div>
        );

      case EndpointType.Partner:
        return (
          <div className="partner-layout">
            {/* 合作伙伴端布局 */}
          </div>
        );

      // ... 其他终端类型的布局

      default:
        return (
          <div className="client-layout">
            {/* 用户前台布局 */}
          </div>
        );
    }
  };

  return renderPlatformLayout();
};

export default AppLayout;
```

## 使用方法

### 1. 在应用入口处使用多端布局

```tsx
import React from 'react';
import { render } from 'react-dom';
import AppLayout from './shared/components/AppLayout';
import App from './App';

render(
  <AppLayout>
    <App />
  </AppLayout>,
  document.getElementById('root')
);
```

### 2. 在组件中使用平台检测

```tsx
import React from 'react';
import { getPlatformInfo, Platform } from '../utils/platform';

const MyComponent: React.FC = () => {
  const { platform, endpoint } = getPlatformInfo();
  
  // 根据平台显示不同内容
  if (platform === Platform.Mobile) {
    return <div>移动端专用组件</div>;
  }
  
  return <div>默认组件</div>;
};

export default MyComponent;
```

### 3. 条件样式

```tsx
import React from 'react';
import { getPlatformInfo, Platform } from '../utils/platform';
import './styles.css'; // 基础样式
import './styles.mobile.css'; // 移动端样式
import './styles.desktop.css'; // 桌面端样式

const StyledComponent: React.FC = () => {
  const { platform } = getPlatformInfo();
  
  // 根据平台添加不同的类名
  const className = `base-component ${platform}-component`;
  
  return <div className={className}>响应式组件</div>;
};

export default StyledComponent;
```

## 多端API处理

在服务端，使用域名或路径前缀区分不同终端的API请求：

```typescript
// 在路由中处理不同终端的请求
import { Hono } from 'hono';

const app = new Hono();

// API端点
app.route('/api', apiRoutes);

// 管理后台端点
app.route('/admin/api', adminApiRoutes);

// 合作伙伴端点
app.route('/partner/api', partnerApiRoutes);

// 员工端端点
app.route('/staff/api', staffApiRoutes);

export { app };
```

## 多端路由配置

通过域名配置映射不同的终端类型：

```typescript
// domain.ts
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

## 多端构建

根据不同的平台和终端类型，配置不同的构建流程：

```json
{
  "scripts": {
    "build:web": "webpack --config webpack.web.config.js",
    "build:mobile": "react-native bundle",
    "build:desktop": "electron-builder",
    "build:miniapp": "taro build --type weapp",
    
    "build:admin": "cross-env ENDPOINT=admin npm run build:web",
    "build:client": "cross-env ENDPOINT=client npm run build:web",
    "build:partner": "cross-env ENDPOINT=partner npm run build:web",
    "build:staff": "cross-env ENDPOINT=staff npm run build:web"
  }
}
```

## 最佳实践

1. **组件抽象**
   - 抽象通用业务逻辑到共享组件
   - 为不同平台提供适配版本
   - 使用条件渲染处理平台差异

2. **响应式设计**
   - 使用Flex和Grid布局
   - 使用相对单位（%, em, rem）
   - 使用媒体查询适配不同屏幕

3. **功能降级**
   - 先实现核心功能，确保所有平台可用
   - 为高级平台添加增强功能
   - 提供优雅的降级方案

4. **统一API交互**
   - 封装API请求逻辑
   - 处理不同平台的异步交互差异
   - 提供一致的数据格式

5. **共享代码最大化**
   - 将业务逻辑与UI分离
   - 使用平台无关的状态管理
   - 共享工具函数和常量 