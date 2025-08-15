import React from 'react';
import { Card, Form, Input, InputNumber, Select, Row, Col, Typography, Empty } from 'antd';
import { useEditor } from '../../store/EditorContext';
import { ComponentType } from '../../utils/componentTypes';

const { Title } = Typography;
const { Option } = Select;

const PropertiesPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { selectedId, components } = state;

  // 查找选中的组件
  const selectedComponent = selectedId
    ? components.find((comp) => comp.id === selectedId)
    : null;

  // 更新组件属性
  const handlePropertyChange = (propName: string, value: any) => {
    if (selectedId) {
      dispatch({
        type: 'UPDATE_COMPONENT',
        id: selectedId,
        props: { [propName]: value },
      });
    }
  };

  // 根据组件类型渲染不同的属性表单
  const renderPropertiesForm = () => {
    if (!selectedComponent) {
      return <Empty description="请选择一个组件以编辑其属性" />;
    }

    switch (selectedComponent.type) {
      case ComponentType.TEXT:
        return (
          <Form layout="vertical">
            <Form.Item label="文本内容">
              <Input
                value={selectedComponent.props.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="字体大小">
              <InputNumber
                value={selectedComponent.props.fontSize}
                min={8}
                max={100}
                onChange={(value) => handlePropertyChange('fontSize', value)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        );

      case ComponentType.BUTTON:
        return (
          <Form layout="vertical">
            <Form.Item label="按钮文本">
              <Input
                value={selectedComponent.props.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="按钮类型">
              <Select
                value={selectedComponent.props.type}
                onChange={(value) => handlePropertyChange('type', value)}
                style={{ width: '100%' }}
              >
                <Option value="primary">主要按钮</Option>
                <Option value="default">默认按钮</Option>
                <Option value="dashed">虚线按钮</Option>
                <Option value="text">文本按钮</Option>
                <Option value="link">链接按钮</Option>
              </Select>
            </Form.Item>
          </Form>
        );

      case ComponentType.IMAGE:
        return (
          <Form layout="vertical">
            <Form.Item label="图片地址">
              <Input
                value={selectedComponent.props.src}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="替代文本">
              <Input
                value={selectedComponent.props.alt}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
              />
            </Form.Item>
          </Form>
        );

      case ComponentType.CONTAINER:
        return (
          <Form layout="vertical">
            <Form.Item label="宽度">
              <Input
                value={selectedComponent.props.width}
                onChange={(e) => handlePropertyChange('width', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="高度">
              <Input
                value={selectedComponent.props.height}
                onChange={(e) => handlePropertyChange('height', e.target.value)}
              />
            </Form.Item>
          </Form>
        );

      case ComponentType.ROW:
        return (
          <Form layout="vertical">
            <Form.Item label="水平对齐">
              <Select
                value={selectedComponent.props.justify}
                onChange={(value) => handlePropertyChange('justify', value)}
                style={{ width: '100%' }}
              >
                <Option value="start">起始</Option>
                <Option value="center">居中</Option>
                <Option value="end">末尾</Option>
                <Option value="space-between">两端</Option>
                <Option value="space-around">均匀</Option>
              </Select>
            </Form.Item>
            <Form.Item label="垂直对齐">
              <Select
                value={selectedComponent.props.align}
                onChange={(value) => handlePropertyChange('align', value)}
                style={{ width: '100%' }}
              >
                <Option value="top">顶部</Option>
                <Option value="middle">中间</Option>
                <Option value="bottom">底部</Option>
              </Select>
            </Form.Item>
          </Form>
        );

      case ComponentType.COLUMN:
        return (
          <Form layout="vertical">
            <Form.Item label="栅格宽度 (1-24)">
              <InputNumber
                value={selectedComponent.props.span}
                min={1}
                max={24}
                onChange={(value) => handlePropertyChange('span', value)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        );

      default:
        return <Empty description="未知组件类型" />;
    }
  };

  return (
    <Card
      title="属性面板"
      style={{ height: '100%' }}
      className="properties-panel"
      bordered={false}
    >
      {renderPropertiesForm()}
      {selectedComponent && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Title level={5}>组件ID: {selectedComponent.id}</Title>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default PropertiesPanel; 