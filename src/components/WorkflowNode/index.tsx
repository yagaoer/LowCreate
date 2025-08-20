import React, { memo, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Button, Tag } from 'antd';
import { 
  DragOutlined, 
  SettingOutlined, 
  DeleteOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { WorkflowNode as WorkflowNodeType, NodeType } from '../../types/workflow';
import { useCanvasNodeDrag } from '../../hooks/useDraggable';
import { useAppDispatch } from '../../store';
import { selectNode, updateNode, deleteNode, duplicateNode } from '../../store/workflowSlice';
import InputNode from './NodeTypes/InputNode';
import OutputNode from './NodeTypes/OutputNode';
import AgentNode from './NodeTypes/AgentNode';
import ConditionNode from './NodeTypes/ConditionNode';
import TransformNode from './NodeTypes/TransformNode';
import DelayNode from './NodeTypes/DelayNode';
import ParallelNode from './NodeTypes/ParallelNode';
import MergeNode from './NodeTypes/MergeNode';

const { Text } = Typography;

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  selected: boolean;
  scale: number;
  onShowProperties?: (nodeId: string) => void;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = memo(({
  node,
  selected,
  scale,
  onShowProperties
}) => {
  const dispatch = useAppDispatch();
  const { drag, isDragging } = useCanvasNodeDrag(node);

  // 处理点击选择
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectNode({ 
      nodeId: node.id, 
      multi: e.ctrlKey || e.metaKey 
    }));
  }, [dispatch, node.id]);

  // 处理双击编辑
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShowProperties?.(node.id);
  }, [node.id, onShowProperties]);

  // 处理删除
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNode(node.id));
  }, [dispatch, node.id]);

  // 处理复制
  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(duplicateNode(node.id));
  }, [dispatch, node.id]);

  // 获取节点图标
  const getNodeIcon = useCallback((nodeType: NodeType) => {
    const icons = {
      [NodeType.INPUT]: '📝',
      [NodeType.OUTPUT]: '📄',
      [NodeType.AGENT]: '🤖',
      [NodeType.CONDITION]: '🔀',
      [NodeType.TRANSFORM]: '🔄',
      [NodeType.DELAY]: '⏰',
      [NodeType.PARALLEL]: '⚡',
      [NodeType.MERGE]: '🔗'
    };
    return icons[nodeType] || '📦';
  }, []);

  // 获取节点状态样式
  const getNodeStatusStyle = useMemo(() => {
    let borderColor = '#d9d9d9';
    let borderWidth = 2;
    let boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    if (selected) {
      borderColor = '#1890ff';
      borderWidth = 3;
      boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
    }

    if (isDragging) {
      boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
    }

    return {
      borderColor,
      borderWidth,
      boxShadow,
      borderStyle: 'solid'
    };
  }, [selected, isDragging]);

  // 渲染节点内容
  const renderNodeContent = useCallback(() => {
    switch (node.type) {
      case NodeType.INPUT:
        return <InputNode node={node} />;
      case NodeType.OUTPUT:
        return <OutputNode node={node} />;
      case NodeType.AGENT:
        return <AgentNode node={node} />;
      case NodeType.CONDITION:
        return <ConditionNode node={node} />;
      case NodeType.TRANSFORM:
        return <TransformNode node={node} />;
      case NodeType.DELAY:
        return <DelayNode node={node} />;
      case NodeType.PARALLEL:
        return <ParallelNode node={node} />;
      case NodeType.MERGE:
        return <MergeNode node={node} />;
      default:
        return (
          <div style={{ padding: '8px', textAlign: 'center' }}>
            <Text type="secondary">未知节点类型</Text>
          </div>
        );
    }
  }, [node]);

  // 渲染操作按钮
  const renderActionButtons = useCallback(() => {
    if (!selected) return null;

    return (
      <div 
        style={{
          position: 'absolute',
          top: -35,
          right: 0,
          display: 'flex',
          gap: '4px',
          background: '#fff',
          padding: '4px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        <Button 
          size="small" 
          icon={<SettingOutlined />}
          onClick={() => onShowProperties?.(node.id)}
          title="属性设置"
        />
        <Button 
          size="small" 
          icon={<CopyOutlined />}
          onClick={handleDuplicate}
          title="复制节点"
        />
        <Button 
          size="small" 
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          danger
          title="删除节点"
        />
      </div>
    );
  }, [selected, node.id, onShowProperties, handleDuplicate, handleDelete]);

  return (
    <div
      ref={drag as any}
      data-node-id={node.id}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.8 : 1,
        zIndex: selected ? 1000 : 1,
        ...getNodeStatusStyle
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Card
        size="small"
        bodyStyle={{ 
          padding: '8px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        style={{
          height: '100%',
          ...node.style,
          ...getNodeStatusStyle
        }}
        title={
          <Space size="small">
            <span style={{ fontSize: '16px' }}>
              {getNodeIcon(node.type)}
            </span>
            <Text 
              style={{ 
                fontSize: '12px', 
                fontWeight: 500,
                color: '#333'
              }}
              ellipsis={{ tooltip: node.data.label }}
            >
              {node.data.label}
            </Text>
          </Space>
        }
        extra={
          <Tag 
            color="blue"
            style={{ fontSize: '10px', margin: 0 }}
          >
            {node.type}
          </Tag>
        }
      >
        {renderNodeContent()}
      </Card>

      {/* 操作按钮 */}
      {renderActionButtons()}

      {/* 拖拽手柄 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: -8,
          transform: 'translateY(-50%)',
          width: 16,
          height: 20,
          background: '#1890ff',
          borderRadius: '0 4px 4px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          opacity: selected ? 1 : 0,
          transition: 'opacity 0.2s'
        }}
      >
        <DragOutlined 
          style={{ 
            color: '#fff', 
            fontSize: '10px' 
          }} 
        />
      </div>

      {/* 连接端点占位符 */}
      {node.ports.inputs.map((port, index) => (
        <div
          key={`input-${port.id}`}
          className="node-port node-port-input"
          data-port-id={port.id}
          data-port-type="input"
          style={{
            position: 'absolute',
            left: -6,
            top: `${(index + 1) * (100 / (node.ports.inputs.length + 1))}%`,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#52c41a',
            border: '2px solid #fff',
            transform: 'translateY(-50%)',
            zIndex: 10,
            cursor: 'crosshair'
          }}
          title={port.label}
        />
      ))}

      {node.ports.outputs.map((port, index) => (
        <div
          key={`output-${port.id}`}
          className="node-port node-port-output"
          data-port-id={port.id}
          data-port-type="output"
          style={{
            position: 'absolute',
            right: -6,
            top: `${(index + 1) * (100 / (node.ports.outputs.length + 1))}%`,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#1890ff',
            border: '2px solid #fff',
            transform: 'translateY(-50%)',
            zIndex: 10,
            cursor: 'crosshair'
          }}
          title={port.label}
        />
      ))}
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;
