import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { FileTextOutlined, ApiOutlined, FileOutlined, LinkOutlined } from '@ant-design/icons';
import { WorkflowNode, OutputNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface OutputNodeProps {
  node: WorkflowNode;
}

const OutputNode: React.FC<OutputNodeProps> = ({ node }) => {
  const data = node.data as OutputNodeData;

  const getOutputTypeIcon = (outputType: string) => {
    switch (outputType) {
      case 'json':
        return <ApiOutlined />;
      case 'text':
        return <FileTextOutlined />;
      case 'file':
        return <FileOutlined />;
      case 'webhook':
        return <LinkOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getOutputTypeLabel = (outputType: string) => {
    const labels = {
      json: 'JSON数据',
      text: '文本输出',
      file: '文件输出',
      webhook: 'Webhook'
    };
    return labels[outputType as keyof typeof labels] || '输出';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        {getOutputTypeIcon(data.outputType)}
        <Text style={{ fontSize: '11px', color: '#666' }}>
          {getOutputTypeLabel(data.outputType)}
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

      {data.format && (
        <div>
          <Text style={{ fontSize: '10px', color: '#999' }}>
            格式: 
          </Text>
          <Text 
            style={{ 
              fontSize: '10px', 
              color: '#666',
              fontFamily: 'monospace'
            }}
            ellipsis={{ tooltip: data.format }}
          >
            {data.format}
          </Text>
        </div>
      )}

      {data.target && (
        <div style={{ marginTop: 'auto' }}>
          <Tag 
            color="blue" 
            style={{ 
              fontSize: '9px', 
              margin: 0
            }}
          >
            目标: {data.target}
          </Tag>
        </div>
      )}
    </div>
  );
};

export default OutputNode;
