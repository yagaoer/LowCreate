import React from 'react';
import { Card } from 'antd';

const Minimap: React.FC = () => {
  return (
    <Card 
      title="缩略图" 
      size="small"
      style={{ 
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        width: '200px',
        height: '150px',
        zIndex: 1000
      }}
      bodyStyle={{ 
        padding: '8px',
        height: 'calc(100% - 40px)'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: '#f0f0f0',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          fontSize: '12px'
        }}>
          缩略图
        </div>
      </div>
    </Card>
  );
};

export default Minimap;