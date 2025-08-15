import React, { useRef, useEffect } from 'react';
import { Card, Empty } from 'antd';
import { useEditor } from '../../store/EditorContext';
import { useCanvasDrop } from '../../hooks/useDragDrop';
import ComponentRenderer from './ComponentRenderer';

const Canvas: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { components, selectedId } = state;
  const { drop, isOver } = useCanvasDrop();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drop(dropRef);
  }, [drop]);

  // 点击画布空白处，取消选中
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: 'SET_SELECTED_ID', id: null });
    }
  };

  // 选中组件
  const handleSelectComponent = (id: string) => {
    dispatch({ type: 'SET_SELECTED_ID', id });
  };

  return (
    <Card
      title="画布"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, overflow: 'auto', padding: 0 }}
    >
      <div 
        ref={dropRef}
        onClick={handleCanvasClick}
        style={{
          height: '100%',
          padding: '20px',
          backgroundColor: isOver ? 'rgba(0, 0, 0, 0.02)' : 'white',
          transition: 'background-color 0.3s',
          position: 'relative',
        }}
      >
        {components.length === 0 ? (
          <Empty description="拖拽组件到此处" style={{ marginTop: '100px' }} />
        ) : (
          components.map((component) => (
            <ComponentRenderer
              key={component.key}
              component={component}
              isSelected={component.id === selectedId}
              onSelect={handleSelectComponent}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default Canvas; 