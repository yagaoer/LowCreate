import React from 'react';
import { ComponentData, ComponentType } from '../../utils/componentTypes';
import { Button, Typography, Image, Row, Col } from 'antd';

const { Text, Title } = Typography;

interface PreviewPanelProps {
  components: ComponentData[];
}

// 预览渲染器，不包含编辑功能，纯展示
const PreviewPanel: React.FC<PreviewPanelProps> = ({ components }) => {
  const renderComponent = (component: ComponentData) => {
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
              padding: '10px',
              ...component.style,
            }}
          >
            {component.children?.map((child) => (
              <ComponentWrapper key={child.key} component={child} />
            ))}
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
              <ComponentWrapper key={child.key} component={child} />
            ))}
          </Row>
        );

      case ComponentType.COLUMN:
        return (
          <Col span={component.props.span || 12} style={component.style}>
            {component.children?.map((child) => (
              <ComponentWrapper key={child.key} component={child} />
            ))}
          </Col>
        );

      default:
        return null;
    }
  };

  // 组件包装器
  const ComponentWrapper: React.FC<{ component: ComponentData }> = ({ component }) => {
    return (
      <div 
        style={{ 
          margin: '5px',
          display: 'inline-block',
        }}
      >
        {renderComponent(component)}
      </div>
    );
  };

  return (
    <div className="preview-panel">
      {components.map((component) => (
        <ComponentWrapper key={component.key} component={component} />
      ))}
    </div>
  );
};

export default PreviewPanel; 