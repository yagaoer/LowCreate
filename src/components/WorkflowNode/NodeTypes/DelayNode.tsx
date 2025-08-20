import React from 'react';
import { Typography, Space, Progress } from 'antd';
import { ClockCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { WorkflowNode, DelayNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface DelayNodeProps {
  node: WorkflowNode;
}

const DelayNode: React.FC<DelayNodeProps> = ({ node }) => {
  const data = node.data as DelayNodeData;

  const formatDuration = (duration: number, unit: string) => {
    const units = {
      ms: '毫秒',
      s: '秒',
      m: '分钟',
      h: '小时'
    };
    return `${duration} ${units[unit as keyof typeof units] || unit}`;
  };

  const getDurationInMs = (duration: number, unit: string) => {
    const multipliers = {
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000
    };
    return duration * (multipliers[unit as keyof typeof multipliers] || 1);
  };

  const getDelayCategory = (durationMs: number) => {
    if (durationMs < 1000) return { label: '极短', color: '#52c41a' };
    if (durationMs < 10000) return { label: '短暂', color: '#1890ff' };
    if (durationMs < 60000) return { label: '中等', color: '#faad14' };
    return { label: '长时间', color: '#f5222d' };
  };

  const durationMs = getDurationInMs(data.duration, data.unit);
  const category = getDelayCategory(durationMs);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        <ClockCircleOutlined />
        <Text style={{ fontSize: '11px', color: '#666' }}>
          延时等待
        </Text>
      </Space>

      {data.description && (
        <Text 
          style={{ 
            fontSize: '10px', 
            color: '#999',
            lineHeight: '1.2'
          }}
          ellipsis={{ tooltip: data.description }}
        >
          {data.description}
        </Text>
      )}

      {/* 延时时间显示 */}
      <div style={{
        background: '#f0f8ff',
        padding: '6px 8px',
        borderRadius: '4px',
        border: '1px solid #d6e4ff',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <PauseCircleOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
          <Text style={{ 
            fontSize: '14px', 
            fontWeight: 600,
            color: '#1890ff'
          }}>
            {formatDuration(data.duration, data.unit)}
          </Text>
        </div>
      </div>

      {/* 延时分类 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <Text style={{ fontSize: '9px', color: '#999' }}>
          时长分类:
        </Text>
        <div style={{
          background: category.color,
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '9px',
          fontWeight: 500
        }}>
          {category.label}
        </div>
      </div>

      {/* 相对时间指示器 */}
      <div style={{ marginTop: '4px' }}>
        <Text style={{ fontSize: '9px', color: '#999' }}>
          执行进度
        </Text>
        <Progress 
          percent={0} 
          size="small" 
          showInfo={false}
          strokeColor={category.color}
          trailColor="#f0f0f0"
        />
      </div>
    </div>
  );
};

export default DelayNode;
