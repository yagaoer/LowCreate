import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { 
  BranchesOutlined, 
  SearchOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { WorkflowNode, ConditionNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface ConditionNodeProps {
  node: WorkflowNode;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ node }) => {
  const data = node.data as ConditionNodeData;

  const getOperatorIcon = (operator: string) => {
    switch (operator) {
      case 'equals':
        return <BranchesOutlined />;
      case 'not_equals':
        return <BranchesOutlined />;
      case 'greater':
        return <BranchesOutlined />;
      case 'less':
        return <BranchesOutlined />;
      case 'contains':
        return <SearchOutlined />;
      case 'regex':
        return <CodeOutlined />;
      default:
        return <BranchesOutlined />;
    }
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      equals: '等于',
      not_equals: '不等于',
      greater: '大于',
      less: '小于',
      contains: '包含',
      regex: '正则匹配'
    };
    return labels[operator as keyof typeof labels] || '条件';
  };

  const getOperatorSymbol = (operator: string) => {
    const symbols = {
      equals: '=',
      not_equals: '≠',
      greater: '>',
      less: '<',
      contains: '∋',
      regex: '~'
    };
    return symbols[operator as keyof typeof symbols] || '?';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        {getOperatorIcon(data.operator)}
        <Text style={{ fontSize: '11px', color: '#666' }}>
          {getOperatorLabel(data.operator)}
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

      {/* 条件表达式 */}
      <div style={{
        background: '#f8f9fa',
        padding: '4px 6px',
        borderRadius: '4px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          <Text 
            style={{ 
              fontSize: '10px', 
              color: '#495057',
              fontWeight: 500
            }}
            ellipsis={{ tooltip: data.condition }}
          >
            {data.condition || 'input'}
          </Text>
          
          <Tag 
            color="orange"
            style={{ 
              fontSize: '9px', 
              margin: 0,
              minWidth: '20px',
              textAlign: 'center'
            }}
          >
            {getOperatorSymbol(data.operator)}
          </Tag>
          
          <Text 
            style={{ 
              fontSize: '10px', 
              color: '#6c757d',
              fontStyle: 'italic'
            }}
            ellipsis={{ tooltip: String(data.value) }}
          >
            {String(data.value) || 'null'}
          </Text>
        </div>
      </div>

      {/* 输出分支提示 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <Tag 
          color="green" 
          style={{ 
            fontSize: '9px', 
            margin: 0,
            flex: 1,
            textAlign: 'center'
          }}
        >
          真 ✓
        </Tag>
        <div style={{ width: '4px' }} />
        <Tag 
          color="red" 
          style={{ 
            fontSize: '9px', 
            margin: 0,
            flex: 1,
            textAlign: 'center'
          }}
        >
          假 ✗
        </Tag>
      </div>
    </div>
  );
};

export default ConditionNode;
