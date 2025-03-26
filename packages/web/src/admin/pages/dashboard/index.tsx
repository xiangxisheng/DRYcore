import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { UserOutlined, CloudServerOutlined, GlobalOutlined, DatabaseOutlined } from '@ant-design/icons';

import StatisticCard from '../../../components/StatisticCard';
import SystemInfo from '../../../components/SystemInfo';
import ActivityLog from '../../../components/ActivityLog';
import { fetchDashboardData, fetchSystemStatus, DashboardData, SystemStatus } from '../../../api/dashboard';
import { fetchActivities } from '../../../api/config';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Array<{time: string, description: string}>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 并行请求所有数据
        const [dashboardResult, statusResult, activitiesResult] = await Promise.all([
          fetchDashboardData(),
          fetchSystemStatus(),
          fetchActivities()
        ]);
        
        setDashboardData(dashboardResult);
        setSystemStatus(statusResult);
        setActivities(activitiesResult);
      } catch (error) {
        console.error('加载仪表板数据出错:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="dashboard">
      <h1>管理控制台</h1>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <StatisticCard
            title="用户总数"
            value={dashboardData?.userCount || 0}
            prefix={<UserOutlined />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            title="服务器数量"
            value={dashboardData?.serverCount || 0}
            prefix={<CloudServerOutlined />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            title="域名数量"
            value={dashboardData?.domainCount || 0}
            prefix={<GlobalOutlined />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatisticCard
            title="数据库数量"
            value={dashboardData?.databaseCount || 0}
            prefix={<DatabaseOutlined />}
            loading={loading}
          />
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <SystemInfo 
            extraInfo={systemStatus ? {
              'CPU使用率': `${systemStatus.cpuUsage}%`,
              '内存使用率': `${systemStatus.memoryUsage}%`,
              '磁盘使用率': `${systemStatus.diskUsage}%`
            } : {}}
          />
        </Col>
        <Col span={12}>
          <ActivityLog activities={activities} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 