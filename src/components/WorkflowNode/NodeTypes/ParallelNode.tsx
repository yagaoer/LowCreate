import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { 
  ThunderboltOutlined, 
  BranchesOutlined, 
  CheckCircleOutlined,
  FastForwardOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { WorkflowNode, ParallelNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface ParallelNodeProps {
  node: WorkflowNode;
}

const ParallelNode: React.FC<ParallelNodeProps> = ({ node }) => {
  const data = node.data as ParallelNodeData;

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'all':
        return <CheckCircleOutlined />;
      case 'race':
        return <FastForwardOutlined />;
      case 'allSettled':
        return <SettingOutlined />;
      default:
        return <BranchesOutlined />;
    }
  };

  const getStrategyLabel = (strategy: string) => {
    const labels = {
      all: '等待全部完成',
      race: '等待首个完成',
      allSettled: '等待全部结束'
    };
    return labels[strategy as keyof typeof labels] || '并行策略';
  };

  const getStrategyColor = (strategy: string) => {
    const colors = {
      all: 'blue',
      race: 'orange',
      allSettled: 'purple'
    };
    return colors[strategy as keyof typeof colors] || 'default';
  };

  const getConcurrencyLevel = (maxConcurrency: number) => {
    if (maxConcurrency <= 2) return { label: '低并发', color: '#52c41a' };
    if (maxConcurrency <= 5) return { label: '中并发', color: '#1890ff' };
    if (maxConcurrency <= 10) return { label: '高并发', color: '#faad14' };
    return { label: '超高并发', color: '#f5222d' };
  };

  const concurrencyInfo = getConcurrencyLevel(data.maxConcurrency);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        <ThunderboltOutlined />
        <Text style={{ fontSize: '11px', color: '#666' }}>
          并行执行
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

      {/* 执行策略 */}
      <div style={{
        background: '#f6f8fa',
        padding: '4px 6px',
        borderRadius: '4px',
        border: '1px solid #e1e4e8'
      }}>
        <Space size="small">
          {getStrategyIcon(data.strategy)}
          <Text style={{ fontSize: '10px', color: '#24292e' }}>
            {getStrategyLabel(data.strategy)}
          </Text>
        </Space>
      </div>

      {/* 并发数配置 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff7e6',
        padding: '4px 6px',
        borderRadius: '4px',
        border: '1px solid #ffd591'
      }}>
        <Text style={{ fontSize: '10px', color: '#d46b08' }}>
          最大并发数
        </Text>
        <div style={{
          background: '#fa8c16',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 600,
          minWidth: '24px',
          textAlign: 'center'
        }}>
          {data.maxConcurrency}
        </div>
      </div>

      {/* 并发级别指示 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <Tag 
          color={getStrategyColor(data.strategy)}
          style={{ 
            fontSize: '9px', 
            margin: 0
          }}
        >
          {data.strategy.toUpperCase()}
        </Tag>
        
        <div style={{
          background: concurrencyInfo.color,
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '9px',
          fontWeight: 500
        }}>
          {concurrencyInfo.label}
        </div>
      </div>

      {/* 性能提示 */}
      <div style={{ textAlign: 'center', marginTop: '2px' }}>
        <Text style={{ fontSize: '8px', color: '#999' }}>
          预计提升 {Math.min(data.maxConcurrency * 0.8, 5).toFixed(1)}x 效率
        </Text>
      </div>
    </div>
  );
};

export default ParallelNode;
