import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Button, Space, Tooltip, message } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';

import { useEditor } from '../../store/EditorContext';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useKeepAlive } from '../../hooks/useKeepAlive';
import Canvas from '../Canvas';
import ComponentPanel from '../ComponentPanel';
import PropertiesPanel from './PropertiesPanel';
import PreviewModal from '../PreviewModal';

const { Header, Content, Sider } = Layout;

const Editor: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { selectedId, history, components } = state;
  const [previewVisible, setPreviewVisible] = useState(false);

  // 使用键盘快捷键
  useKeyboardShortcut();

  // 使用KeepAlive功能 - 关键技术实现点
  const { restoredComponents, restoredSelectedId } = useKeepAlive(
    'editor-main',
    components,
    selectedId
  );

  // 在组件首次加载时恢复状态
  useEffect(() => {
    if (restoredComponents && restoredComponents.length > 0) {
      // 这里可以添加恢复逻辑
      console.log('恢复编辑器状态', restoredComponents);
    }
  }, [restoredComponents]);

  // 撤销操作
  const handleUndo = () => {
    if (history.past.length === 0) {
      message.warning('没有可撤销的操作');
      return;
    }
    dispatch({ type: 'UNDO' });
    message.success('撤销成功');
  };

  // 重做操作
  const handleRedo = () => {
    if (history.future.length === 0) {
      message.warning('没有可重做的操作');
      return;
    }
    dispatch({ type: 'REDO' });
    message.success('重做成功');
  };

  // 删除操作
  const handleDelete = () => {
    if (selectedId) {
      dispatch({ type: 'DELETE_COMPONENT', id: selectedId });
      message.success('删除成功');
    }
  };

  // 复制操作
  const handleCopy = () => {
    if (selectedId) {
      const selectedComponent = state.components.find(comp => comp.id === selectedId);
      if (selectedComponent) {
        dispatch({ type: 'SET_CLIPBOARD', component: selectedComponent });
        message.success('复制成功');
      }
    }
  };

  // 预览操作
  const handlePreview = () => {
    if (components.length === 0) {
      message.warning('画布为空，无法预览');
      return;
    }
    setPreviewVisible(true);
  };

  // 保存功能
  const handleSave = () => {
    const projectData = {
      components,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    localStorage.setItem('lowcode-project', JSON.stringify(projectData));
    message.success('项目已保存到本地');
  };

  // 导出JSON
  const handleExport = () => {
    const projectData = {
      components,
      meta: {
        title: 'LowCode页面',
        timestamp: new Date().toISOString(),
        componentCount: components.length
      }
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lowcode-page-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ height: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0, color: '#1890ff' }}>
                LowCreate 低代码平台
                <span style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>
                  组件数量: {components.length}
                </span>
              </h2>
            </Col>
            <Col>
              <Space>
                <Tooltip title="撤销 (Ctrl+Z)">
                  <Button 
                    icon={<UndoOutlined />} 
                    onClick={handleUndo}
                    disabled={history.past.length === 0}
                  />
                </Tooltip>
                <Tooltip title="重做 (Ctrl+Shift+Z)">
                  <Button 
                    icon={<RedoOutlined />} 
                    onClick={handleRedo}
                    disabled={history.future.length === 0}
                  />
                </Tooltip>
                <Tooltip title="删除 (Delete)">
                  <Button 
                    icon={<DeleteOutlined />} 
                    onClick={handleDelete}
                    disabled={!selectedId}
                  />
                </Tooltip>
                <Tooltip title="复制 (Ctrl+C)">
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={handleCopy}
                    disabled={!selectedId}
                  />
                </Tooltip>
                <Tooltip title="保存项目">
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                  />
                </Tooltip>
                <Tooltip title="导出JSON">
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleExport}
                    disabled={components.length === 0}
                  />
                </Tooltip>
                <Tooltip title="预览页面">
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    onClick={handlePreview}
                    disabled={components.length === 0}
                  >
                    预览
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Header>
        <Layout>
          <Sider width={250} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
            <ComponentPanel />
          </Sider>
          <Content style={{ padding: '0 16px' }}>
            <Canvas />
          </Content>
          <Sider width={300} theme="light" style={{ borderLeft: '1px solid #f0f0f0' }}>
            <PropertiesPanel />
          </Sider>
        </Layout>
      </Layout>

      <PreviewModal 
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        components={components}
      />
    </DndProvider>
  );
};

export default Editor; 