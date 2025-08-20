import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { jsPlumb, jsPlumbInstance } from 'jsplumb';
import { useAppDispatch, useAppSelector, selectNodes, selectConnections, selectCanvas } from '../store';
import { addConnection, deleteConnection } from '../store/workflowSlice';
import { WorkflowNode, WorkflowConnection, ConnectionType } from '../types/workflow';

// jsPlumb连接配置
const CONNECTION_CONFIG = {
  anchor: ['Top', 'Bottom', 'Left', 'Right'],
  connector: ['Bezier', { curviness: 50 }],
  paintStyle: {
    stroke: '#d9d9d9',
    strokeWidth: 2
  },
  hoverPaintStyle: {
    stroke: '#1890ff',
    strokeWidth: 3
  },
  endpointStyle: {
    fill: '#fff',
    stroke: '#d9d9d9',
    strokeWidth: 2,
    radius: 6
  },
  endpointHoverStyle: {
    fill: '#1890ff',
    stroke: '#1890ff'
  },
  overlays: [
    ['Arrow', {
      location: 1,
      length: 10,
      width: 8,
      paintStyle: { fill: '#d9d9d9' }
    }]
  ]
};

// 端点配置
const ENDPOINT_CONFIG = {
  input: {
    anchor: 'Left',
    isTarget: true,
    isSource: false,
    maxConnections: -1,
    paintStyle: {
      fill: '#52c41a',
      stroke: '#389e0d',
      strokeWidth: 2,
      radius: 6
    }
  },
  output: {
    anchor: 'Right',
    isTarget: false,
    isSource: true,
    maxConnections: -1,
    paintStyle: {
      fill: '#1890ff',
      stroke: '#096dd9',
      strokeWidth: 2,
      radius: 6
    }
  }
};

export const useJsPlumb = (containerId: string) => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const connections = useAppSelector(selectConnections);
  const canvas = useAppSelector(selectCanvas);
  
  const jsPlumbRef = useRef<jsPlumbInstance | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const endpointsRef = useRef<Map<string, any>>(new Map());
  const connectionsRef = useRef<Map<string, any>>(new Map());

  // 初始化jsPlumb实例
  const initializeJsPlumb = useCallback(() => {
    if (jsPlumbRef.current) {
      jsPlumbRef.current.reset();
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    containerRef.current = container;
    
    // 创建jsPlumb实例
    jsPlumbRef.current = jsPlumb.getInstance({
      Container: container,
      ...CONNECTION_CONFIG
    });

    // 监听连接事件
    jsPlumbRef.current.bind('connection', (info: any) => {
      const { source, target, sourceEndpoint, targetEndpoint } = info;
      
      // 防止重复添加连接
      if (info.connection.pending) return;
      
      const sourceNodeId = source.getAttribute('data-node-id');
      const targetNodeId = target.getAttribute('data-node-id');
      const sourcePortId = sourceEndpoint.getParameter('portId');
      const targetPortId = targetEndpoint.getParameter('portId');

      if (sourceNodeId && targetNodeId && sourcePortId && targetPortId) {
        const newConnection: Omit<WorkflowConnection, 'id'> = {
          sourceId: sourceNodeId,
          targetId: targetNodeId,
          sourcePort: sourcePortId,
          targetPort: targetPortId,
          type: ConnectionType.DEFAULT
        };

        dispatch(addConnection(newConnection));
      }
    });

    // 监听连接删除事件
    jsPlumbRef.current.bind('connectionDetached', (info: any) => {
      const connectionId = info.connection.getParameter('connectionId');
      if (connectionId) {
        dispatch(deleteConnection(connectionId));
      }
    });

    // 监听连接点击事件
    jsPlumbRef.current.bind('click', (connection: any) => {
      const connectionId = connection.getParameter('connectionId');
      if (connectionId) {
        // 可以在这里处理连接选择逻辑
        console.log('Connection clicked:', connectionId);
      }
    });

  }, [containerId, dispatch]);

  // 创建节点端点
  const createNodeEndpoints = useCallback((node: WorkflowNode) => {
    if (!jsPlumbRef.current) return;

    const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
    if (!nodeElement) return;

    // 清除现有端点
    const existingEndpoints = endpointsRef.current.get(node.id);
    if (existingEndpoints) {
      existingEndpoints.forEach((endpoint: any) => {
        jsPlumbRef.current?.deleteEndpoint(endpoint);
      });
    }

    const nodeEndpoints: any[] = [];

    // 创建输入端点
    node.ports.inputs.forEach((port, index) => {
      const endpoint = jsPlumbRef.current!.addEndpoint(nodeElement, {
        ...ENDPOINT_CONFIG.input,
        anchor: [0, (index + 1) / (node.ports.inputs.length + 1), -1, 0],
        uuid: `${node.id}-${port.id}`,
        parameters: {
          nodeId: node.id,
          portId: port.id,
          portType: 'input'
        }
      });
      nodeEndpoints.push(endpoint);
    });

    // 创建输出端点
    node.ports.outputs.forEach((port, index) => {
      const endpoint = jsPlumbRef.current!.addEndpoint(nodeElement, {
        ...ENDPOINT_CONFIG.output,
        anchor: [1, (index + 1) / (node.ports.outputs.length + 1), 1, 0],
        uuid: `${node.id}-${port.id}`,
        parameters: {
          nodeId: node.id,
          portId: port.id,
          portType: 'output'
        }
      });
      nodeEndpoints.push(endpoint);
    });

    endpointsRef.current.set(node.id, nodeEndpoints);

    // 设置节点为可拖拽
    jsPlumbRef.current.setDraggable(nodeElement, true);

  }, []);

  // 创建连接
  const createConnection = useCallback((connection: WorkflowConnection) => {
    if (!jsPlumbRef.current) return;

    const sourceUuid = `${connection.sourceId}-${connection.sourcePort}`;
    const targetUuid = `${connection.targetId}-${connection.targetPort}`;

    const jsPlumbConnection = jsPlumbRef.current.connect({
      uuids: [sourceUuid, targetUuid],
      parameters: {
        connectionId: connection.id
      }
    });

    // 设置连接样式
    if (jsPlumbConnection) {
      try {
        (jsPlumbConnection as any).setPaintStyle?.(getConnectionStyle(connection.type));
        (jsPlumbConnection as any).addOverlay?.(['Arrow', {
          location: 1,
          length: 10,
          width: 8,
          paintStyle: { fill: getConnectionColor(connection.type) }
        }]);
      } catch (error) {
        console.warn('jsPlumb API error:', error);
      }
    }

    if (jsPlumbConnection) {
      connectionsRef.current.set(connection.id, jsPlumbConnection);
    }
  }, []);

  // 删除连接
  const removeConnection = useCallback((connectionId: string) => {
    if (!jsPlumbRef.current) return;

    const jsPlumbConnection = connectionsRef.current.get(connectionId);
    if (jsPlumbConnection) {
      jsPlumbRef.current.deleteConnection(jsPlumbConnection);
      connectionsRef.current.delete(connectionId);
    }
  }, []);

  // 更新画布缩放
  const updateCanvasZoom = useCallback((zoom: number) => {
    if (!jsPlumbRef.current || !containerRef.current) return;

    jsPlumbRef.current.setZoom(zoom);
    jsPlumbRef.current.repaintEverything();
  }, []);

  // 重新绘制连接
  const repaintConnections = useCallback(() => {
    if (!jsPlumbRef.current) return;
    jsPlumbRef.current.repaintEverything();
  }, []);

  // 设置节点拖拽
  const setNodeDraggable = useCallback((nodeId: string, draggable: boolean) => {
    if (!jsPlumbRef.current) return;

    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
    if (nodeElement) {
      jsPlumbRef.current.setDraggable(nodeElement, draggable);
    }
  }, []);

  // 高亮连接
  const highlightConnection = useCallback((connectionId: string, highlight: boolean) => {
    const jsPlumbConnection = connectionsRef.current.get(connectionId);
    if (jsPlumbConnection) {
      try {
        if (highlight) {
          (jsPlumbConnection as any).setPaintStyle?.({
            stroke: '#1890ff',
            strokeWidth: 3
          });
        } else {
          const connection = connections.find(c => c.id === connectionId);
          if (connection) {
            (jsPlumbConnection as any).setPaintStyle?.(getConnectionStyle(connection.type));
          }
        }
      } catch (error) {
        console.warn('jsPlumb highlight error:', error);
      }
    }
  }, [connections]);

  // 初始化和清理
  useEffect(() => {
    initializeJsPlumb();

    return () => {
      if (jsPlumbRef.current) {
        jsPlumbRef.current.reset();
      }
    };
  }, [initializeJsPlumb]);

  // 监听节点变化
  useEffect(() => {
    nodes.forEach(node => {
      createNodeEndpoints(node);
    });
  }, [nodes, createNodeEndpoints]);

  // 监听连接变化
  useEffect(() => {
    // 清除所有现有连接
    connectionsRef.current.forEach((jsPlumbConnection, connectionId) => {
      if (!connections.find(c => c.id === connectionId)) {
        jsPlumbRef.current?.deleteConnection(jsPlumbConnection);
        connectionsRef.current.delete(connectionId);
      }
    });

    // 创建新连接
    connections.forEach(connection => {
      if (!connectionsRef.current.has(connection.id)) {
        createConnection(connection);
      }
    });
  }, [connections, createConnection]);

  // 监听画布缩放变化
  useEffect(() => {
    updateCanvasZoom(canvas.zoom);
  }, [canvas.zoom, updateCanvasZoom]);

  return {
    jsPlumbInstance: jsPlumbRef.current,
    repaintConnections,
    setNodeDraggable,
    highlightConnection,
    initializeJsPlumb
  };
};

// 辅助函数：获取连接样式
function getConnectionStyle(type: ConnectionType) {
  const styles = {
    [ConnectionType.DEFAULT]: { stroke: '#d9d9d9', strokeWidth: 2 },
    [ConnectionType.SUCCESS]: { stroke: '#52c41a', strokeWidth: 2 },
    [ConnectionType.ERROR]: { stroke: '#f5222d', strokeWidth: 2 },
    [ConnectionType.CONDITION_TRUE]: { stroke: '#52c41a', strokeWidth: 2, strokeDasharray: '5,5' },
    [ConnectionType.CONDITION_FALSE]: { stroke: '#f5222d', strokeWidth: 2, strokeDasharray: '5,5' }
  };
  return styles[type] || styles[ConnectionType.DEFAULT];
}

// 辅助函数：获取连接颜色
function getConnectionColor(type: ConnectionType): string {
  const colors = {
    [ConnectionType.DEFAULT]: '#d9d9d9',
    [ConnectionType.SUCCESS]: '#52c41a',
    [ConnectionType.ERROR]: '#f5222d',
    [ConnectionType.CONDITION_TRUE]: '#52c41a',
    [ConnectionType.CONDITION_FALSE]: '#f5222d'
  };
  return colors[type] || colors[ConnectionType.DEFAULT];
}

// 自定义Hook：用于检测jsPlumb是否准备就绪
export const useJsPlumbReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof jsPlumb !== 'undefined') {
      setIsReady(true);
    } else {
      // 如果jsPlumb还没有加载，监听其加载完成
      const checkJsPlumb = () => {
        if (typeof jsPlumb !== 'undefined') {
          setIsReady(true);
        } else {
          setTimeout(checkJsPlumb, 100);
        }
      };
      checkJsPlumb();
    }
  }, []);

  return isReady;
};
