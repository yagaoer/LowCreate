import React, { useRef, useEffect } from 'react';
import { Button, Typography, Image, Row, Col, Space } from 'antd';
import { ComponentData, ComponentType } from '../../utils/componentTypes';
import { useComponentDrag } from '../../hooks/useDragDrop';

const { Text, Title } = Typography;

// 组件渲染器属性
interface ComponentRendererProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// 组件渲染器
const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onSelect,
}) => {
  const { drag, isDragging } = useComponentDrag(component.id, component.type as ComponentType);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drag(ref);
  }, [drag]);

  // 处理组件点击事件
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  };

  // 根据组件类型渲染不同的组件
  const renderComponent = () => {
    switch (component.type) {
      case ComponentType.TEXT:
        return (
          <Text
            style={{
              fontSize: component.props.fontSize || 14,
              ...component.style,
            }}
          >
            {component.props.content}
          </Text>
        );

      case ComponentType.BUTTON:
        return (
          <Button type={component.props.type || 'primary'} style={component.style}>
            {component.props.text}
          </Button>
        );

      case ComponentType.IMAGE:
        return (
          <Image
            src={component.props.src}
            alt={component.props.alt}
            style={{ maxWidth: '100%', ...component.style }}
            preview={false}
          />
        );

      case ComponentType.CONTAINER:
        return (
          <div
            style={{
              width: component.props.width || '100%',
              height: component.props.height || '100px',
              border: '1px dashed #ccc',
              padding: '10px',
              ...component.style,
            }}
          >
            {component.children?.map((child) => (
              <ComponentRenderer
                key={child.key}
                component={child}
                isSelected={false}
                onSelect={onSelect}
              />
            )) || null}
          </div>
        );

      case ComponentType.ROW:
        return (
          <Row
            justify={component.props.justify || 'start'}
            align={component.props.align || 'middle'}
            style={component.style}
          >
            {component.children?.map((child) => (
              <ComponentRenderer
                key={child.key}
                component={child}
                isSelected={false}
                onSelect={onSelect}
              />
            )) || null}
          </Row>
        );

      case ComponentType.COLUMN:
        return (
          <Col span={component.props.span || 12} style={component.style}>
            {component.children?.map((child) => (
              <ComponentRenderer
                key={child.key}
                component={child}
                isSelected={false}
                onSelect={onSelect}
              />
            )) || null}
          </Col>
        );

      default:
        return <div>未知组件类型</div>;
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        margin: '5px',
        border: isSelected ? '2px solid #1890ff' : 'none',
        padding: isSelected ? '2px' : '4px',
      }}
      data-component-id={component.id}
    >
      {renderComponent()}
    </div>
  );
};

export default ComponentRenderer; 