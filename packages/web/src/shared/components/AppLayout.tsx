import React from 'react';
import { getPlatformInfo, Platform, EndpointType } from '@/utils/platform';

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
            <header className="admin-header">
              <h1>DRYcore 管理后台</h1>
            </header>
            <div className="admin-container">
              <aside className="admin-sidebar">
                <nav className="admin-nav">
                  <ul>
                    <li>控制台</li>
                    <li>用户管理</li>
                    <li>系统设置</li>
                  </ul>
                </nav>
              </aside>
              <main className="admin-content">{children}</main>
            </div>
            <footer className="admin-footer">
              <p>DRYcore Admin © {new Date().getFullYear()}</p>
            </footer>
          </div>
        );

      case EndpointType.Partner:
        return (
          <div className="partner-layout">
            <header className="partner-header">
              <h1>DRYcore 合作伙伴平台</h1>
            </header>
            <div className="partner-container">
              <aside className="partner-sidebar">
                <nav className="partner-nav">
                  <ul>
                    <li>数据概览</li>
                    <li>客户管理</li>
                    <li>财务管理</li>
                  </ul>
                </nav>
              </aside>
              <main className="partner-content">{children}</main>
            </div>
            <footer className="partner-footer">
              <p>DRYcore Partner © {new Date().getFullYear()}</p>
            </footer>
          </div>
        );

      case EndpointType.Staff:
        return (
          <div className="staff-layout">
            <header className="staff-header">
              <h1>DRYcore 员工端</h1>
            </header>
            <div className="staff-container">
              <aside className="staff-sidebar">
                <nav className="staff-nav">
                  <ul>
                    <li>工单管理</li>
                    <li>客户管理</li>
                    <li>任务列表</li>
                  </ul>
                </nav>
              </aside>
              <main className="staff-content">{children}</main>
            </div>
            <footer className="staff-footer">
              <p>DRYcore Staff © {new Date().getFullYear()}</p>
            </footer>
          </div>
        );

      default:
        // 默认用户前台布局
        return (
          <div className="client-layout">
            <header className="client-header">
              <h1>DRYcore</h1>
              <nav className="client-nav">
                <ul>
                  <li>首页</li>
                  <li>产品</li>
                  <li>解决方案</li>
                  <li>价格</li>
                  <li>登录/注册</li>
                </ul>
              </nav>
            </header>
            <main className="client-content">{children}</main>
            <footer className="client-footer">
              <div className="footer-container">
                <div className="footer-column">
                  <h3>产品</h3>
                  <ul>
                    <li>功能特性</li>
                    <li>最新动态</li>
                    <li>路线图</li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h3>资源</h3>
                  <ul>
                    <li>文档</li>
                    <li>教程</li>
                    <li>API</li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h3>公司</h3>
                  <ul>
                    <li>关于我们</li>
                    <li>联系我们</li>
                    <li>招贤纳士</li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <p>DRYcore © {new Date().getFullYear()} 版权所有</p>
              </div>
            </footer>
          </div>
        );
    }
  };

  return renderPlatformLayout();
};

export default AppLayout;
