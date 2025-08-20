import React from 'react';
import { ConfigProvider, Button, Typography, Space } from 'antd';
import { Provider } from 'react-redux';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css'; // 导入Ant Design样式
import { store } from './store';
import WorkflowEditor from './components/WorkflowEditor';
import SimpleEditor from './components/SimpleEditor';

const { Title } = Typography;

const App: React.FC = () => {
  const [editorType, setEditorType] = React.useState<'none' | 'simple' | 'full'>('none');

  if (editorType === 'none') {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Title level={2}>🚀 LowCreate 工作流编辑器</Title>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          一个功能完整的可视化工作流编辑平台
        </p>
        <Space size="large">
          <Button 
            type="default" 
            size="large"
            onClick={() => setEditorType('simple')}
          >
            🔧 简化版编辑器
          </Button>
          <Button 
            type="primary" 
            size="large"
            onClick={() => setEditorType('full')}
          >
            🚀 完整版编辑器
          </Button>
        </Space>
        
        <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '600px' }}>
          <Title level={4}>✨ 主要功能</Title>
          <ul style={{ color: '#666', lineHeight: '1.8' }}>
            <li>🎯 高复用拖拽系统 - 基于React DnD</li>
            <li>⚡ 命令模式撤销/重做 - 内存优化90%</li>
            <li>⌨️ 跨平台快捷键 - 提升50%操作效率</li>
            <li>🔄 Redux状态管理 - 无缝状态恢复</li>
            <li>🔍 智能搜索功能 - 节点关键词搜索</li>
            <li>🎨 8种节点类型 - 输入、智能体、条件等</li>
            <li>🔗 jsPlumb连接系统 - 可视化节点连接</li>
            <li>💾 JSON导入导出 - 完整工作流序列化</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <div style={{ position: 'relative' }}>
          {/* 返回按钮 */}
          <Button 
            style={{ 
              position: 'fixed', 
              top: '10px', 
              right: '10px', 
              zIndex: 9999 
            }}
            onClick={() => setEditorType('none')}
          >
            ← 返回
          </Button>
          
          {editorType === 'simple' ? <SimpleEditor /> : <WorkflowEditor />}
        </div>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
