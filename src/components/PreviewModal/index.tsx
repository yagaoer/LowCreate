import React from 'react';
import { Modal, Button } from 'antd';
import { ComponentData } from '../../utils/componentTypes';
import PreviewPanel from '../PreviewPanel';

interface PreviewModalProps {
  visible: boolean;
  onClose: () => void;
  components: ComponentData[];
}

const PreviewModal: React.FC<PreviewModalProps> = ({ 
  visible, 
  onClose, 
  components 
}) => {
  return (
    <Modal
      title="页面预览"
      open={visible}
      onCancel={onClose}
      width="80%"
      style={{ top: 20 }}
      bodyStyle={{ 
        height: '70vh', 
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
        padding: '20px' 
      }}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭预览
        </Button>
      ]}
    >
      <div 
        style={{ 
          backgroundColor: 'white',
          minHeight: '100%',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <PreviewPanel components={components} />
      </div>
    </Modal>
  );
};

export default PreviewModal; 