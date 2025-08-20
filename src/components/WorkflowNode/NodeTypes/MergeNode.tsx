import React from 'react';
import { Typography, Space, Tag, Progress } from 'antd';
import { 
  MergeOutlined, 
  HourglassOutlined, 
  FastForwardOutlined,
  HistoryOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { WorkflowNode, MergeNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface MergeNodeProps {
  node: WorkflowNode;
}

const MergeNode: React.FC<MergeNodeProps> = ({ node }) => {
  const data = node.data as MergeNodeData;

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'waitAll':
        return <HourglassOutlined />;
      case 'first':
        return <FastForwardOutlined />;
      case 'latest':
        return <HistoryOutlined />;
      default:
        return <MergeOutlined />;
    }
  };

  const getStrategyLabel = (strategy: string) => {
    const labels = {
      waitAll: '等待全部输入',
      first: '接受首个输入',
      latest: '接受最新输入'
    };
    return labels[strategy as keyof typeof labels] || '合并策略';
  };

  const getStrategyColor = (strategy: string) => {
    const colors = {
      waitAll: 'blue',
      first: 'green',
      latest: 'purple'
    };
    return colors[strategy as keyof typeof colors] || 'default';
  };

  const formatTimeout = (timeout?: number) => {
    if (!timeout) return null;
    if (timeout < 1000) return `${timeout}ms`;
    if (timeout < 60000) return `${(timeout / 1000).toFixed(1)}s`;
    return `${(timeout / 60000).toFixed(1)}m`;
  };

  const getTimeoutLevel = (timeout?: number) => {
    if (!timeout) return null;
    if (timeout <= 5000) return { label: '快速', color: '#52c41a' };
    if (timeout <= 30000) return { label: '标准', color: '#1890ff' };
    if (timeout <= 120000) return { label: '较长', color: '#faad14' };
    return { label: '超长', color: '#f5222d' };
  };

  const timeoutInfo = data.timeout ? getTimeoutLevel(data.timeout) : null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        <MergeOutlined />
        <Text style={{ fontSize: '11px', color: '#666' }}>
          数据合并
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

      {/* 合并策略 */}
      <div style={{
        background: '#f0f8ff',
        padding: '4px 6px',
        borderRadius: '4px',
        border: '1px solid #d6e4ff'
      }}>
        <Space size="small">
          {getStrategyIcon(data.strategy)}
          <Text style={{ fontSize: '10px', color: '#1d39c4' }}>
            {getStrategyLabel(data.strategy)}
          </Text>
        </Space>
      </div>

      {/* 超时设置 */}
      {data.timeout && (
        <div style={{
          background: timeoutInfo?.color ? `${timeoutInfo.color}15` : '#f6f8fa',
          padding: '4px 6px',
          borderRadius: '4px',
          border: `1px solid ${timeoutInfo?.color || '#e1e4e8'}40`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <Space size="small">
              <ClockCircleOutlined style={{ 
                color: timeoutInfo?.color || '#666',
                fontSize: '10px' 
              }} />
              <Text style={{ fontSize: '10px', color: '#666' }}>
                超时时间
              </Text>
            </Space>
            <Text style={{ 
              fontSize: '11px', 
              fontWeight: 600,
              color: timeoutInfo?.color || '#666'
            }}>
              {formatTimeout(data.timeout)}
            </Text>
          </div>
        </div>
      )}

      {/* 状态指示器 */}
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
          {data.strategy}
        </Tag>
        
        {timeoutInfo && (
          <div style={{
            background: timeoutInfo.color,
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '9px',
            fontWeight: 500
          }}>
            {timeoutInfo.label}
          </div>
        )}
      </div>

      {/* 输入进度模拟 */}
      {data.strategy === 'waitAll' && (
        <div style={{ marginTop: '4px' }}>
          <Text style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>
            输入进度
          </Text>
          <Progress 
            percent={0} 
            size="small" 
            showInfo={false}
            strokeColor="#722ed1"
            trailColor="#f0f0f0"
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '2px'
          }}>
            <Text style={{ fontSize: '8px', color: '#999' }}>
              0/2 输入
            </Text>
            <Text style={{ fontSize: '8px', color: '#999' }}>
              等待中...
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeNode;
