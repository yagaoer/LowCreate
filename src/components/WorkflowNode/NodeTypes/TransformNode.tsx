import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { 
  SwapOutlined, 
  FilterOutlined, 
  FunctionOutlined, 
  SortAscendingOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { WorkflowNode, TransformNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface TransformNodeProps {
  node: WorkflowNode;
}

const TransformNode: React.FC<TransformNodeProps> = ({ node }) => {
  const data = node.data as TransformNodeData;

  const getTransformIcon = (transformation: string) => {
    switch (transformation) {
      case 'map':
        return <SwapOutlined />;
      case 'filter':
        return <FilterOutlined />;
      case 'reduce':
        return <FunctionOutlined />;
      case 'sort':
        return <SortAscendingOutlined />;
      case 'custom':
        return <CodeOutlined />;
      default:
        return <SwapOutlined />;
    }
  };

  const getTransformLabel = (transformation: string) => {
    const labels = {
      map: '数据映射',
      filter: '数据过滤',
      reduce: '数据聚合',
      sort: '数据排序',
      custom: '自定义转换'
    };
    return labels[transformation as keyof typeof labels] || '转换';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        {getTransformIcon(data.transformation)}
        <Text style={{ fontSize: '11px', color: '#666' }}>
          {getTransformLabel(data.transformation)}
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

      {data.language && (
        <Tag 
          color="purple" 
          style={{ 
            fontSize: '10px', 
            margin: 0,
            alignSelf: 'flex-start'
          }}
        >
          {data.language}
        </Tag>
      )}

      {data.script && (
        <div style={{
          background: '#f6f8fa',
          padding: '4px 6px',
          borderRadius: '4px',
          border: '1px solid #e1e4e8',
          marginTop: 'auto'
        }}>
          <Text 
            style={{ 
              fontSize: '9px', 
              color: '#586069',
              fontFamily: 'monospace',
              lineHeight: '1.2'
            }}
            ellipsis={{ tooltip: data.script }}
          >
            {data.script.split('\n')[0] || '// 转换脚本'}
          </Text>
          {data.script.split('\n').length > 1 && (
            <Text style={{ fontSize: '9px', color: '#959da5' }}>
              ...
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default TransformNode;
