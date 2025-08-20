import React from 'react';
import { Modal, Empty } from 'antd';

interface PreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      title="工作流预览"
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ top: 20 }}
      bodyStyle={{ height: '70vh', overflow: 'auto' }}
    >
      <Empty 
        description="工作流预览功能开发中"
        style={{ marginTop: '100px' }}
      />
    </Modal>
  );
};

export default PreviewModal;