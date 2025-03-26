import React, { useState } from 'react';
import { Layout, Button, Dropdown, Menu, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import AppMenu from './AppMenu';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  // 切换侧边栏
  const toggleSider = () => {
    setCollapsed(!collapsed);
  };
  
  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ];
  
  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 清除token并重定向到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (key === 'profile') {
      // 导航到个人信息页面
      window.location.href = '/profile';
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
      >
        <div className="logo">
          <h1>{collapsed ? 'DC' : 'DRYcore管理后台'}</h1>
        </div>
        <AppMenu />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div className="header-container">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSider}
              className="trigger-btn"
            />
            <div className="header-right">
              <Dropdown 
                menu={{ 
                  items: userMenuItems,
                  onClick: handleUserMenuClick
                }} 
                placement="bottomRight"
              >
                <span className="user-dropdown">
                  <Avatar icon={<UserOutlined />} />
                  <span className="username">管理员</span>
                </span>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 