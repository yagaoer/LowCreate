import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Row, Col, Button, Space, Tooltip, message } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  SnippetsOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  FullscreenOutlined
} from '@ant-design/icons';

import { useAppDispatch, useAppSelector } from '../../store';
import { 
  selectNodes, 
  selectConnections, 
  selectCanvas, 
  selectSelectedNodes,
  selectCanUndo,
  selectCanRedo,
  selectClipboard
} from '../../store';
import {
  undo,
  redo,
  copyToClipboard,
  pasteFromClipboard,
  deleteNode,
  deleteConnection,
  zoomCanvas,
  updateCanvas,
  clearSelection
} from '../../store/workflowSlice';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useJsPlumb } from '../../hooks/useJsPlumb';
import { useCanvasInteraction, useCanvasDrop, useAreaSelection } from '../../hooks/useDraggable';

import WorkflowCanvas from './WorkflowCanvas';
import NodePanel from './NodePanel';
import PropertiesPanel from './PropertiesPanel';
import SearchPanel from './SearchPanel';
import Minimap from './Minimap';
import PreviewModal from './PreviewModal';

const { Header, Content, Sider } = Layout;

// 内部编辑器组件，包含所有需要DnD上下文的逻辑
const WorkflowEditorInner: React.FC = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const connections = useAppSelector(selectConnections);
  const canvas = useAppSelector(selectCanvas);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const clipboard = useAppSelector(selectClipboard);

  // 状态管理
  const [showPreview, setShowPreview] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);

  // 自定义 Hooks (现在在DndProvider内部调用)
  useKeyboardShortcut();
  const { jsPlumbInstance, repaintConnections } = useJsPlumb('workflow-canvas');
  const { 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleWheel, 
    handleKeyDown,
    isPanning 
  } = useCanvasInteraction();
  const { drop: canvasDrop, isOver: canvasIsOver, canDrop: canvasCanDrop } = useCanvasDrop();
  const {
    isSelecting,
    selectionRect,
    startSelection,
    updateSelection,
    endSelection
  } = useAreaSelection();

  // 工具栏操作
  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  const handleCopy = useCallback(() => {
    if (selectedNodes.length > 0) {
      dispatch(copyToClipboard());
      message.success(`已复制 ${selectedNodes.length} 个节点`);
    }
  }, [dispatch, selectedNodes]);

  const handlePaste = useCallback(() => {
    if (clipboard) {
      const pastePosition = {
        x: canvas.position.x + 100,
        y: canvas.position.y + 100
      };
      dispatch(pasteFromClipboard(pastePosition));
      message.success('已粘贴节点');
    }
  }, [dispatch, clipboard, canvas.position]);

  const handleDelete = useCallback(() => {
    selectedNodes.forEach(nodeId => {
      dispatch(deleteNode(nodeId));
    });
    if (selectedNodes.length > 0) {
      message.success(`已删除 ${selectedNodes.length} 个节点`);
    }
  }, [dispatch, selectedNodes]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(canvas.zoom * 1.2, 3);
    dispatch(zoomCanvas({ zoom: newZoom }));
  }, [dispatch, canvas.zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(canvas.zoom / 1.2, 0.1);
    dispatch(zoomCanvas({ zoom: newZoom }));
  }, [dispatch, canvas.zoom]);

  const handleZoomFit = useCallback(() => {
    if (nodes.length === 0) return;

    // 计算所有节点的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    });

    if (editorRef.current) {
      const containerRect = editorRef.current.getBoundingClientRect();
      const contentWidth = maxX - minX + 200; // 添加边距
      const contentHeight = maxY - minY + 200;
      
      const scaleX = containerRect.width / contentWidth;
      const scaleY = containerRect.height / contentHeight;
      const newZoom = Math.min(scaleX, scaleY, 1);
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      dispatch(updateCanvas({
        zoom: newZoom,
        position: {
          x: containerRect.width / 2 - centerX * newZoom,
          y: containerRect.height / 2 - centerY * newZoom
        }
      }));
    }
  }, [dispatch, nodes]);

  const handleResetView = useCallback(() => {
    dispatch(updateCanvas({
      zoom: 1,
      position: { x: 0, y: 0 }
    }));
  }, [dispatch]);

  // 预览功能
  const handleShowPreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  // 显示属性面板
  const handleShowProperties = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowProperties(true);
  }, []);

  // 保存工作流
  const handleSave = useCallback(() => {
    // 这里可以实现保存到本地存储或服务器
    const workflowData = { nodes, connections, canvas };
    localStorage.setItem('workflow-data', JSON.stringify(workflowData));
    message.success('工作流已保存');
  }, [nodes, connections, canvas]);

  // 导出工作流
  const handleExport = useCallback(() => {
    const workflowData = { nodes, connections, canvas };
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('工作流已导出');
  }, [nodes, connections, canvas]);

  // 监听键盘事件
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        // 选择所有节点
      }
      
      // 搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleSave]);

  // 重新绘制连接线
  useEffect(() => {
    if (jsPlumbInstance) {
      repaintConnections();
    }
  }, [canvas.zoom, canvas.position, repaintConnections, jsPlumbInstance]);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {/* 顶部工具栏 */}
        <Header 
          style={{ 
            background: '#fff', 
            padding: '0 16px',
            borderBottom: '1px solid #f0f0f0',
            height: '48px',
            lineHeight: '48px'
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <h3 style={{ margin: 0, color: '#1890ff' }}>
                🚀 工作流编辑器
              </h3>
            </Col>
            <Col>
              <Space>
                {/* 撤销重做 */}
                <Tooltip title="撤销 (Ctrl+Z)">
                  <Button 
                    icon={<UndoOutlined />} 
                    onClick={handleUndo}
                    disabled={!canUndo}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="重做 (Ctrl+Shift+Z)">
                  <Button 
                    icon={<RedoOutlined />} 
                    onClick={handleRedo}
                    disabled={!canRedo}
                    size="small"
                  />
                </Tooltip>
                
                {/* 编辑操作 */}
                <Tooltip title="复制 (Ctrl+C)">
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={handleCopy}
                    disabled={selectedNodes.length === 0}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="粘贴 (Ctrl+V)">
                  <Button 
                    icon={<SnippetsOutlined />} 
                    onClick={handlePaste}
                    disabled={!clipboard}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="删除 (Delete)">
                  <Button 
                    icon={<DeleteOutlined />} 
                    onClick={handleDelete}
                    disabled={selectedNodes.length === 0}
                    danger
                    size="small"
                  />
                </Tooltip>

                {/* 视图操作 */}
                <Tooltip title="放大">
                  <Button 
                    icon={<ZoomInOutlined />} 
                    onClick={handleZoomIn}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="缩小">
                  <Button 
                    icon={<ZoomOutOutlined />} 
                    onClick={handleZoomOut}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="适应画布">
                  <Button 
                    icon={<CompressOutlined />} 
                    onClick={handleZoomFit}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="重置视图">
                  <Button 
                    icon={<FullscreenOutlined />} 
                    onClick={handleResetView}
                    size="small"
                  />
                </Tooltip>

                {/* 文件操作 */}
                <Tooltip title="保存 (Ctrl+S)">
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                    size="small"
                  />
                </Tooltip>
                <Tooltip title="导出">
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleExport}
                    size="small"
                  />
                </Tooltip>

                {/* 预览 */}
                <Tooltip title="预览">
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    onClick={handleShowPreview}
                    size="small"
                  >
                    预览
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Header>

        <Layout>
          {/* 左侧节点面板 */}
          <Sider 
            width={280} 
            theme="light" 
            style={{ borderRight: '1px solid #f0f0f0' }}
          >
            <NodePanel />
            {showSearch && (
              <SearchPanel onClose={() => setShowSearch(false)} />
            )}
          </Sider>

          {/* 主画布区域 */}
          <Content style={{ position: 'relative', overflow: 'hidden' }}>
            <div
              ref={editorRef}
              style={{ 
                width: '100%', 
                height: '100%',
                position: 'relative',
                cursor: isPanning ? 'grabbing' : 'default'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <WorkflowCanvas
                canvasDrop={canvasDrop}
                onShowProperties={handleShowProperties}
                selectionRect={selectionRect}
                isSelecting={isSelecting}
                startSelection={startSelection}
                updateSelection={updateSelection}
                endSelection={endSelection}
                isOver={canvasIsOver}
                canDrop={canvasCanDrop}
                nodes={nodes}
              />
            </div>

            {/* 缩略图 */}
            {showMinimap && (
              <div style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                width: 200,
                height: 150,
                background: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                <Minimap />
              </div>
            )}

            {/* 缩放指示器 */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {Math.round(canvas.zoom * 100)}%
            </div>
          </Content>

          {/* 右侧属性面板 */}
          {showProperties && (
            <Sider 
              width={320} 
              theme="light" 
              style={{ borderLeft: '1px solid #f0f0f0' }}
            >
              <PropertiesPanel 
                nodeId={selectedNodeId}
                onClose={() => setShowProperties(false)}
              />
            </Sider>
          )}
        </Layout>

        {/* 预览模态框 */}
        <PreviewModal 
          visible={showPreview}
          onClose={() => setShowPreview(false)}
        />
      </Layout>
  );
};

// 外层组件，提供DnD上下文
const WorkflowEditor: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <WorkflowEditorInner />
    </DndProvider>
  );
};

export default WorkflowEditor;
