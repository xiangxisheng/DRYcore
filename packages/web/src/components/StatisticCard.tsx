import React from 'react';
import { Card, Statistic } from 'antd';

interface StatisticCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  loading?: boolean;
}

/**
 * 统计卡片组件
 * 用于显示各种统计数据，可在多个页面复用
 */
const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  loading = false
}) => {
  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
      />
    </Card>
  );
};

export default StatisticCard; 