import React, { useRef, useEffect } from 'react';
import { Card, Space, Typography, Button, Row, Col } from 'antd';
import { ComponentType } from '../../utils/componentTypes';
import { usePanelDrag } from '../../hooks/useDragDrop';
import {
  FontSizeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  BorderOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

// 组件类型配置
const componentConfigs = [
  {
    type: ComponentType.TEXT,
    title: '文本',
    icon: <FontSizeOutlined />,
  },
  {
    type: ComponentType.BUTTON,
    title: '按钮',
    icon: <BorderOutlined />,
  },
  {
    type: ComponentType.IMAGE,
    title: '图片',
    icon: <PictureOutlined />,
  },
  {
    type: ComponentType.CONTAINER,
    title: '容器',
    icon: <AppstoreOutlined />,
  },
  {
    type: ComponentType.ROW,
    title: '行',
    icon: <ColumnWidthOutlined />,
  },
  {
    type: ComponentType.COLUMN,
    title: '列',
    icon: <ColumnHeightOutlined />,
  },
];

// 单个组件项
const ComponentItem: React.FC<{
  type: ComponentType;
  title: string;
  icon: React.ReactNode;
}> = ({ type, title, icon }) => {
  const { drag, isDragging } = usePanelDrag(type);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drag(ref);
  }, [drag]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        border: '1px dashed #d9d9d9',
        padding: '8px',
        textAlign: 'center',
        marginBottom: '8px',
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {icon}
        <span>{title}</span>
      </Space>
    </div>
  );
};

// 组件面板
const ComponentPanel: React.FC = () => {
  return (
    <Card title="组件面板" style={{ height: '100%' }}>
      <Row gutter={[8, 8]}>
        {componentConfigs.map((config) => (
          <Col span={12} key={config.type}>
            <ComponentItem {...config} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default ComponentPanel; 