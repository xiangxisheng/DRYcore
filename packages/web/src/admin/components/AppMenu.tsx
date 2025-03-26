import React, { useEffect, useState } from 'react';
import { Menu, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import * as icons from '@ant-design/icons';
import { getMenuConfig, MenuItem, loadAllConfigs, hasPermission } from '../config';

// 动态图标组件
const IconComponent = ({ iconName }: { iconName: string }) => {
  const Icon = (icons as any)[`${iconName}Outlined`] || (icons as any).AppstoreOutlined;
  return <Icon />;
};

const AppMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // 加载菜单配置
  useEffect(() => {
    const initMenu = async () => {
      try {
        await loadAllConfigs();
        const config = getMenuConfig();
        setMenuItems(config);
      } catch (error) {
        console.error('加载菜单失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initMenu();
  }, []);
  
  // 设置选中的菜单项
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      setSelectedKeys([pathParts[0]]);
    }
  }, [location.pathname]);
  
  // 处理菜单点击
  const handleMenuClick = (key: string, path: string) => {
    navigate(path);
  };
  
  // 递归渲染菜单项
  const renderMenuItems = (items: MenuItem[]) => {
    return items.map(item => {
      // 检查权限
      if (item.permissions && item.permissions.length > 0) {
        const hasAccess = item.permissions.some(p => hasPermission(p));
        if (!hasAccess) return null;
      }
      
      // 如果有子菜单，渲染子菜单
      if (item.children && item.children.length > 0) {
        const childItems = renderMenuItems(item.children);
        
        // 如果没有可显示的子菜单，则不显示父菜单
        if (childItems.filter(Boolean).length === 0) {
          return null;
        }
        
        return (
          <Menu.SubMenu 
            key={item.key} 
            title={item.label}
            icon={<IconComponent iconName={item.icon} />}
          >
            {childItems}
          </Menu.SubMenu>
        );
      }
      
      // 渲染普通菜单项
      return (
        <Menu.Item 
          key={item.key} 
          icon={<IconComponent iconName={item.icon} />}
          onClick={() => handleMenuClick(item.key, item.path)}
        >
          {item.label}
        </Menu.Item>
      );
    });
  };
  
  if (loading) {
    return <Spin size="large" className="menu-loading" />;
  }
  
  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={selectedKeys}
      className="app-menu"
    >
      {renderMenuItems(menuItems)}
    </Menu>
  );
};

export default AppMenu; 