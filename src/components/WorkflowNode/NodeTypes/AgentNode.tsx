import React from 'react';
import { Typography, Space, Tag, Progress } from 'antd';
import { RobotOutlined, FunctionOutlined, ToolOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { WorkflowNode, AgentNodeData } from '../../../types/workflow';

const { Text } = Typography;

interface AgentNodeProps {
  node: WorkflowNode;
}

const AgentNode: React.FC<AgentNodeProps> = ({ node }) => {
  const data = node.data as AgentNodeData;

  const getAgentTypeIcon = (agentType: string) => {
    switch (agentType) {
      case 'llm':
        return <RobotOutlined />;
      case 'function':
        return <FunctionOutlined />;
      case 'tool':
        return <ToolOutlined />;
      default:
        return <ThunderboltOutlined />;
    }
  };

  const getAgentTypeLabel = (agentType: string) => {
    const labels = {
      llm: 'LLM模型',
      function: '函数调用',
      tool: '工具调用'
    };
    return labels[agentType as keyof typeof labels] || '智能体';
  };

  const getModelDisplayName = (model?: string) => {
    if (!model) return '';
    const modelNames = {
      'gpt-3.5-turbo': 'GPT-3.5',
      'gpt-4': 'GPT-4',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'claude-3-sonnet': 'Claude 3 Sonnet',
      'claude-3-opus': 'Claude 3 Opus'
    };
    return modelNames[model as keyof typeof modelNames] || model;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Space size="small" style={{ fontSize: '11px' }}>
        {getAgentTypeIcon(data.agentType)}
        <Text style={{ fontSize: '11px', color: '#666' }}>
          {getAgentTypeLabel(data.agentType)}
        </Text>
      </Space>

      {data.model && (
        <Tag 
          color="blue" 
          style={{ 
            fontSize: '10px', 
            margin: 0,
            alignSelf: 'flex-start'
          }}
        >
          {getModelDisplayName(data.model)}
        </Tag>
      )}

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

      {data.prompt && (
        <div>
          <Text style={{ fontSize: '10px', color: '#999' }}>
            提示词: 
          </Text>
          <Text 
            style={{ 
              fontSize: '10px', 
              color: '#666',
              fontFamily: 'monospace',
              background: '#f5f5f5',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            ellipsis={{ tooltip: data.prompt }}
          >
            {data.prompt}
          </Text>
        </div>
      )}

      {data.temperature !== undefined && (
        <div style={{ marginTop: 'auto' }}>
          <Space size="small" style={{ width: '100%' }}>
            <Text style={{ fontSize: '9px', color: '#999' }}>
              温度:
            </Text>
            <div style={{ flex: 1 }}>
              <Progress 
                percent={data.temperature * 100} 
                size="small" 
                showInfo={false}
                strokeColor={data.temperature > 0.7 ? '#ff7875' : data.temperature > 0.3 ? '#ffa940' : '#73d13d'}
              />
            </div>
            <Text style={{ fontSize: '9px', color: '#666' }}>
              {data.temperature}
            </Text>
          </Space>
        </div>
      )}

      {data.functions && data.functions.length > 0 && (
        <Tag 
          color="green" 
          style={{ 
            fontSize: '9px', 
            margin: 0,
            alignSelf: 'flex-start'
          }}
        >
          {data.functions.length} 个函数
        </Tag>
      )}
    </div>
  );
};

export default AgentNode;
