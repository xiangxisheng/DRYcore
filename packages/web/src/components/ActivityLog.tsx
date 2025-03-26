import React from 'react';
import { Card, List, Typography } from 'antd';

const { Text } = Typography;

interface Activity {
  time: string;
  description: string;
}

interface ActivityLogProps {
  activities: Activity[];
  title?: string;
  height?: number;
}

/**
 * 活动日志组件
 * 可在多个页面复用的活动日志显示组件
 */
const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  title = "最近活动",
  height = 300
}) => {
  if (!activities || activities.length === 0) {
    return (
      <Card title={title} style={{ height }}>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">暂无活动记录</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} style={{ height }}>
      <List
        size="small"
        dataSource={activities}
        renderItem={(activity) => (
          <List.Item>
            <Text>{activity.time} - {activity.description}</Text>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ActivityLog; 