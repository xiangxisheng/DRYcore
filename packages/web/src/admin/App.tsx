import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AdminLayout from './components/Layout';
import { loadAllConfigs, isConfigLoaded } from './config';
import Dashboard from './pages/dashboard';

// 登录组件
const Login = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>DRYcore管理后台登录</h1>
    <button 
      onClick={() => {
        localStorage.setItem('token', 'admin-token');
        window.location.href = '/admin';
      }}
      style={{ padding: '10px 20px', fontSize: '16px' }}
    >
      模拟管理员登录
    </button>
  </div>
);

// 鉴权路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        // 加载配置同时也验证了用户身份
        if (!isConfigLoaded()) {
          await loadAllConfigs();
        }
        
        setAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        message.error('验证失败，请重新登录');
        localStorage.removeItem('token');
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            {/* 其他页面路由添加在这里 */}
          </Route>
          
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App; 