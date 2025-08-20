import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { FileTextOutlined, NumberOutlined, FileOutlined, ApiOutlined } from '@ant-design/icons';
import { WorkflowNode, InputNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface InputNodeProps {
  node: WorkflowNode;
}

const InputNode: React.FC<InputNodeProps> = ({ node }) => {
  const data = node.data as InputNodeData;

  const getInputTypeIcon = (inputType: string) => {
    switch (inputType) {
      case 'text':
        return <FileTextOutlined />;
      case 'number':
        return <NumberOutlined />;
      case 'file':
        return <FileOutlined />;
      case 'json':
        return <ApiOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getInputTypeLabel = (inputType: string) => {
    const labels = {
      text: '文本',
      number: '数字',
      file: '文件',
      json: 'JSON'
    };
    return labels[inputType as keyof typeof labels] || '未知';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        {getInputTypeIcon(data.inputType)}
        <Text style={{ fontSize: '11px', color: '#666' }}>
          {getInputTypeLabel(data.inputType)}
        </Text>
        {data.required && (
          <Tag color="red" style={{ fontSize: '10px', margin: 0 }}>
            必填
          </Tag>
        )}
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

      {data.defaultValue && (
        <div>
          <Text style={{ fontSize: '10px', color: '#999' }}>
            默认值: 
          </Text>
          <Text 
            style={{ 
              fontSize: '10px', 
              color: '#666',
              fontFamily: 'monospace'
            }}
            ellipsis={{ tooltip: String(data.defaultValue) }}
          >
            {String(data.defaultValue)}
          </Text>
        </div>
      )}

      {data.validation && (
        <div style={{ marginTop: 'auto' }}>
          <Text style={{ fontSize: '9px', color: '#999' }}>
            验证规则已配置
          </Text>
        </div>
      )}
    </div>
  );
};

export default InputNode;
