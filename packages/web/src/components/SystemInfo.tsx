import React, { useEffect, useState } from 'react';
import { Card, Skeleton } from 'antd';
import { fetchAppConfig, AppConfig } from '@/api/config';

interface SystemInfoProps {
  title?: string;
  height?: number;
  extraInfo?: Record<string, string>;
}

/**
 * 系统信息组件
 * 显示应用名称、版本等系统信息
 * 所有数据从后端API获取，实现DRY
 */
const SystemInfo: React.FC<SystemInfoProps> = ({
  title = "系统信息",
  height = 300,
  extraInfo = {}
}) => {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const config = await fetchAppConfig();
        setAppConfig(config);
      } catch (error) {
        console.error('加载应用配置失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  if (loading) {
    return (
      <Card title={title} style={{ height }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }
  
  return (
    <Card title={title} style={{ height }}>
      <p><strong>应用名称：</strong> {appConfig?.appName || '未知'}</p>
      <p><strong>版本：</strong> {appConfig?.version || '未知'}</p>
      <p><strong>运行环境：</strong> {appConfig?.environment || '未知'}</p>
      <p><strong>NodeJS版本：</strong> {appConfig?.nodeVersion || '未知'}</p>
      <p><strong>数据库：</strong> {appConfig?.database || '未知'}</p>
      
      {/* 渲染额外信息 */}
      {Object.entries(extraInfo).map(([key, value]) => (
        <p key={key}><strong>{key}：</strong> {value}</p>
      ))}
    </Card>
  );
};

export default SystemInfo; 