import React from 'react';
import { Card, Empty, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PropertiesPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ nodeId, onClose }) => {
  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>属性面板</span>
          <Button 
            type="text" 
            size="small" 
            icon={<CloseOutlined />} 
            onClick={onClose}
          />
        </div>
      } 
      size="small" 
      style={{ height: '100%' }}
    >
      {nodeId ? (
        <div>
          <Text strong>节点ID: </Text>
          <Text code>{nodeId.substring(0, 8)}...</Text>
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">节点属性编辑功能开发中...</Text>
          </div>
        </div>
      ) : (
        <Empty 
          description="选择一个节点查看属性"
          style={{ marginTop: '40px' }}
        />
      )}
    </Card>
  );
};

export default PropertiesPanel;