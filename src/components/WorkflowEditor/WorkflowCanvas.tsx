import React from 'react';
import { Card } from 'antd';
import { WorkflowNode } from '../../types/workflow';
import WorkflowNodeComponent from '../WorkflowNode';

interface Position {
  x: number;
  y: number;
}

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WorkflowCanvasProps {
  canvasDrop: (node: HTMLDivElement | null) => void;
  onShowProperties: (nodeId: string) => void;
  selectionRect: SelectionRect | null;
  isSelecting: boolean;
  startSelection: (point: Position) => void;
  updateSelection: (point: Position) => void;
  endSelection: () => void;
  isOver?: boolean;
  canDrop?: boolean;
  nodes: WorkflowNode[];
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  canvasDrop,
  onShowProperties,
  selectionRect,
  isSelecting,
  startSelection,
  updateSelection,
  endSelection,
  isOver = false,
  canDrop = false,
  nodes
}) => {
  return (
    <Card 
      title="画布" 
      style={{ height: '100%' }}
      bodyStyle={{ height: 'calc(100% - 57px)' }}
    >
      <div 
        ref={canvasDrop}
        style={{ 
          width: '100%', 
          height: '100%', 
          background: isOver && canDrop ? '#e6f7ff' : '#fafafa',
          border: isOver && canDrop ? '2px dashed #1890ff' : '1px solid #d9d9d9',
          position: 'relative',
          cursor: isSelecting ? 'crosshair' : 'default',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {/* 选择框 */}
        {isSelecting && selectionRect && (
          <div
            style={{
              position: 'absolute',
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
              border: '1px dashed #1890ff',
              background: 'rgba(24, 144, 255, 0.1)',
              pointerEvents: 'none'
            }}
          />
        )}
        
        {/* 渲染节点 */}
        {nodes.map((node) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            selected={!!node.selected}
            scale={1.0}
            onShowProperties={onShowProperties}
          />
        ))}
        
        {/* 空状态提示 */}
        {nodes.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            textAlign: 'center'
          }}>
            <p>工作流画布</p>
            <p style={{ fontSize: '12px' }}>从左侧拖拽节点到这里</p>
            <p style={{ fontSize: '10px', marginTop: '10px' }}>
              支持拖拽创建、选择框选择、双击编辑等功能
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkflowCanvas;