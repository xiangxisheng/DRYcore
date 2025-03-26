import React from 'react';
import { Card } from 'antd';
import { APP_CONFIG } from '../config';

interface SystemInfoProps {
  title?: string;
  height?: number;
  extraInfo?: Record<string, string>;
}

/**
 * 系统信息组件
 * 显示应用名称、版本等系统信息
 */
const SystemInfo: React.FC<SystemInfoProps> = ({
  title = "系统信息",
  height = 300,
  extraInfo = {}
}) => {
  const { appName, version, environment, nodeVersion, database } = APP_CONFIG;
  
  return (
    <Card title={title} style={{ height }}>
      <p><strong>应用名称：</strong> {appName}</p>
      <p><strong>版本：</strong> {version}</p>
      <p><strong>运行环境：</strong> {environment}</p>
      <p><strong>NodeJS版本：</strong> {nodeVersion}</p>
      <p><strong>数据库：</strong> {database}</p>
      
      {/* 渲染额外信息 */}
      {Object.entries(extraInfo).map(([key, value]) => (
        <p key={key}><strong>{key}：</strong> {value}</p>
      ))}
    </Card>
  );
};

export default SystemInfo; 