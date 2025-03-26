import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CloudServerOutlined, GlobalOutlined, DatabaseOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>飞儿云管理控制台</h1>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={1280}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="服务器数量"
              value={98}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="域名数量"
              value={156}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="数据库数量"
              value={64}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="系统信息" style={{ height: 300 }}>
            <p><strong>应用名称：</strong> 飞儿云管理系统</p>
            <p><strong>版本：</strong> v0.1.0</p>
            <p><strong>运行环境：</strong> 开发环境</p>
            <p><strong>NodeJS版本：</strong> v18.x</p>
            <p><strong>数据库：</strong> PostgreSQL</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近活动" style={{ height: 300 }}>
            <p>2023-03-24 10:30 - 用户 admin 登录系统</p>
            <p>2023-03-24 09:45 - 创建了新服务器 web-01</p>
            <p>2023-03-24 09:15 - 数据库备份完成</p>
            <p>2023-03-23 18:20 - 系统例行维护</p>
            <p>2023-03-23 15:10 - 添加新域名 example.com</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 