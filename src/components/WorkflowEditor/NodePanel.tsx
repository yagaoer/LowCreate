import React from 'react';
import { Card, Typography, Space } from 'antd';
import { 
  PlayCircleOutlined, 
  RobotOutlined,
  BranchesOutlined,
  FileTextOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  FastForwardOutlined,
  MergeCellsOutlined
} from '@ant-design/icons';
import { useDrag } from 'react-dnd';
import { NodeType } from '../../types/workflow';

const { Text } = Typography;

// 拖拽节点项组件
interface DragNodeItemProps {
  nodeType: NodeType;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const DragNodeItem: React.FC<DragNodeItemProps> = ({ nodeType, icon, label, color }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'node_template',
    item: { 
      type: 'node_template',
      nodeType,
      name: label
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={drag as any}
      style={{ 
        padding: '8px', 
        border: '1px dashed #d9d9d9', 
        borderRadius: '4px',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f0f0f0' : '#fff',
        transition: 'all 0.2s'
      }}
    >
      <span style={{ marginRight: '8px', color }}>{icon}</span>
      <Text>{label}</Text>
    </div>
  );
};

const NodePanel: React.FC = () => {
  return (
    <Card title="节点面板" size="small" style={{ height: '100%' }}>
      <Space direction="vertical" style={{ width: '100%', gap: '8px' }}>
        <DragNodeItem 
          nodeType={NodeType.INPUT}
          icon={<PlayCircleOutlined />}
          label="输入节点"
          color="#52c41a"
        />
        
        <DragNodeItem 
          nodeType={NodeType.AGENT}
          icon={<RobotOutlined />}
          label="智能体节点"
          color="#1890ff"
        />
        
        <DragNodeItem 
          nodeType={NodeType.CONDITION}
          icon={<BranchesOutlined />}
          label="条件节点"
          color="#faad14"
        />
        
        <DragNodeItem 
          nodeType={NodeType.TRANSFORM}
          icon={<SwapOutlined />}
          label="转换节点"
          color="#722ed1"
        />
        
        <DragNodeItem 
          nodeType={NodeType.DELAY}
          icon={<ClockCircleOutlined />}
          label="延时节点"
          color="#13c2c2"
        />
        
        <DragNodeItem 
          nodeType={NodeType.PARALLEL}
          icon={<FastForwardOutlined />}
          label="并行节点"
          color="#eb2f96"
        />
        
        <DragNodeItem 
          nodeType={NodeType.MERGE}
          icon={<MergeCellsOutlined />}
          label="合并节点"
          color="#f5222d"
        />
        
        <DragNodeItem 
          nodeType={NodeType.OUTPUT}
          icon={<FileTextOutlined />}
          label="输出节点"
          color="#fa8c16"
        />
      </Space>
    </Card>
  );
};

export default NodePanel;