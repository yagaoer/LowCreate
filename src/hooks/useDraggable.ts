import { useRef, useCallback, useEffect, useState } from 'react';
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { useAppDispatch, useAppSelector, selectCanvas, selectSelectedNodes } from '../store';
import { addNode, updateNode, selectNode, clearSelection, panCanvas, zoomCanvas } from '../store/workflowSlice';
import { NodeType, Position, WorkflowNode } from '../types/workflow';
import { screenToCanvas, snapToGrid } from '../utils/workflowHelpers';

// 拖拽项目类型
export const DragTypes = {
  NODE_TEMPLATE: 'node_template',
  CANVAS_NODE: 'canvas_node',
  SELECTION: 'selection'
};

// 节点模板拖拽项
export interface NodeTemplateDragItem {
  type: typeof DragTypes.NODE_TEMPLATE;
  nodeType: NodeType;
  name: string;
}

// 画布节点拖拽项
export interface CanvasNodeDragItem {
  type: typeof DragTypes.CANVAS_NODE;
  nodeId: string;
  offset: Position;
}

// 多选拖拽项
export interface SelectionDragItem {
  type: typeof DragTypes.SELECTION;
  nodeIds: string[];
  offsetMap: Record<string, Position>;
}

// 节点模板拖拽Hook（用于组件面板）
export const useNodeTemplateDrag = (nodeType: NodeType, name: string) => {
  const [{ isDragging }, drag, preview] = useDrag<NodeTemplateDragItem, void, { isDragging: boolean }>({
    type: DragTypes.NODE_TEMPLATE,
    item: { type: DragTypes.NODE_TEMPLATE, nodeType, name },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return { drag, preview, isDragging };
};

// 画布节点拖拽Hook
export const useCanvasNodeDrag = (node: WorkflowNode) => {
  const dispatch = useAppDispatch();
  const canvas = useAppSelector(selectCanvas);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const [{ isDragging }, drag] = useDrag<CanvasNodeDragItem, void, { isDragging: boolean }>({
    type: DragTypes.CANVAS_NODE,
    item: () => {
      // 如果当前节点不在选中列表中，选中它
      if (!selectedNodes.includes(node.id)) {
        dispatch(selectNode({ nodeId: node.id, multi: false }));
      }

      return {
        type: DragTypes.CANVAS_NODE,
        nodeId: node.id,
        offset: dragOffset
      };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) return;

      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      // 更新节点位置
      const newPosition = {
        x: node.position.x + delta.x / canvas.zoom,
        y: node.position.y + delta.y / canvas.zoom
      };

      // 如果启用了网格对齐
      const finalPosition = canvas.snapToGrid 
        ? snapToGrid(newPosition, canvas.gridSize)
        : newPosition;

      dispatch(updateNode({
        id: node.id,
        updates: { position: finalPosition, dragging: false }
      }));
    },
  });

  // 开始拖拽时设置拖拽状态
  useEffect(() => {
    if (isDragging && !node.dragging) {
      dispatch(updateNode({
        id: node.id,
        updates: { dragging: true }
      }));
    }
  }, [isDragging, node.dragging, node.id, dispatch]);

  return { drag, isDragging };
};

// 多选拖拽Hook
export const useSelectionDrag = (selectedNodeIds: string[]) => {
  const dispatch = useAppDispatch();
  const canvas = useAppSelector(selectCanvas);
  const nodes = useAppSelector(state => state.workflow.workflow.nodes);

  const [{ isDragging }, drag] = useDrag<SelectionDragItem, void, { isDragging: boolean }>({
    type: DragTypes.SELECTION,
    item: () => {
      // 计算每个节点相对于拖拽起始点的偏移
      const offsetMap: Record<string, Position> = {};
      const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));
      
      if (selectedNodes.length === 0) return { type: DragTypes.SELECTION, nodeIds: [], offsetMap: {} };

      // 以第一个节点作为参考点
      const referenceNode = selectedNodes[0];
      selectedNodes.forEach(node => {
        offsetMap[node.id] = {
          x: node.position.x - referenceNode.position.x,
          y: node.position.y - referenceNode.position.y
        };
      });

      return {
        type: DragTypes.SELECTION,
        nodeIds: selectedNodeIds,
        offsetMap
      };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) return;

      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      // 更新所有选中节点的位置
      const scaledDelta = {
        x: delta.x / canvas.zoom,
        y: delta.y / canvas.zoom
      };

      selectedNodeIds.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const newPosition = {
          x: node.position.x + scaledDelta.x,
          y: node.position.y + scaledDelta.y
        };

        const finalPosition = canvas.snapToGrid 
          ? snapToGrid(newPosition, canvas.gridSize)
          : newPosition;

        dispatch(updateNode({
          id: nodeId,
          updates: { position: finalPosition, dragging: false }
        }));
      });
    },
  });

  return { drag, isDragging };
};

// 画布放置Hook
export const useCanvasDrop = () => {
  const dispatch = useAppDispatch();
  const canvas = useAppSelector(selectCanvas);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    NodeTemplateDragItem | CanvasNodeDragItem | SelectionDragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: [DragTypes.NODE_TEMPLATE, DragTypes.CANVAS_NODE, DragTypes.SELECTION],
    drop: (item, monitor) => {
      if (!canvasRef.current) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // 获取画布元素的边界矩形
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // 计算相对于画布的位置
      const canvasPosition = {
        x: clientOffset.x - canvasRect.left,
        y: clientOffset.y - canvasRect.top
      };

      // 转换为画布坐标系
      const worldPosition = screenToCanvas(canvasPosition, canvas.position, canvas.zoom);

      if (item.type === DragTypes.NODE_TEMPLATE) {
        // 创建新节点
        const finalPosition = canvas.snapToGrid 
          ? snapToGrid(worldPosition, canvas.gridSize)
          : worldPosition;

        dispatch(addNode({
          type: (item as NodeTemplateDragItem).nodeType,
          position: finalPosition
        }));
      }
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // 合并refs
  const setRef = useCallback((node: HTMLDivElement | null) => {
    canvasRef.current = node;
    drop(node);
  }, [drop]);

  return { drop: setRef, isOver, canDrop };
};

// 画布平移和缩放Hook
export const useCanvasInteraction = () => {
  const dispatch = useAppDispatch();
  const canvas = useAppSelector(selectCanvas);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Position>({ x: 0, y: 0 });

  // 处理鼠标按下事件（开始平移）
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // 只在中键或者按住空格键时才开始平移
    if (event.button === 1 || (event.button === 0 && event.altKey)) {
      event.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, []);

  // 处理鼠标移动事件（平移中）
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isPanning) return;

    event.preventDefault();
    const deltaX = event.clientX - lastPanPoint.x;
    const deltaY = event.clientY - lastPanPoint.y;

    dispatch(panCanvas({ deltaX, deltaY }));
    setLastPanPoint({ x: event.clientX, y: event.clientY });
  }, [isPanning, lastPanPoint, dispatch]);

  // 处理鼠标松开事件（结束平移）
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // 处理滚轮事件（缩放）
  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      const zoomDelta = -event.deltaY * 0.001;
      const newZoom = Math.max(0.1, Math.min(3, canvas.zoom + zoomDelta));
      
      // 计算缩放中心点
      const rect = event.currentTarget.getBoundingClientRect();
      const center = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };

      dispatch(zoomCanvas({ zoom: newZoom, center }));
    }
  }, [canvas.zoom, dispatch]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // 删除选中的节点/连接
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // 这里可以调用删除选中项的action
    }
    
    // 全选
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      // 这里可以调用全选的action
    }
    
    // 清除选择
    if (event.key === 'Escape') {
      dispatch(clearSelection());
    }
  }, [dispatch]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleKeyDown,
    isPanning
  };
};

// 区域选择Hook
export const useAreaSelection = () => {
  const dispatch = useAppDispatch();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Position>({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState<Position>({ x: 0, y: 0 });

  const startSelection = useCallback((point: Position) => {
    setIsSelecting(true);
    setSelectionStart(point);
    setSelectionEnd(point);
  }, []);

  const updateSelection = useCallback((point: Position) => {
    if (isSelecting) {
      setSelectionEnd(point);
    }
  }, [isSelecting]);

  const endSelection = useCallback(() => {
    if (isSelecting) {
      // 计算选择区域
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      // 只有在区域足够大时才执行选择
      if (maxX - minX > 10 && maxY - minY > 10) {
        // 这里可以调用区域选择的action
        // dispatch(selectArea({ startPos: { x: minX, y: minY }, endPos: { x: maxX, y: maxY } }));
      }

      setIsSelecting(false);
    }
  }, [isSelecting, selectionStart, selectionEnd]);

  const selectionRect = isSelecting ? {
    x: Math.min(selectionStart.x, selectionEnd.x),
    y: Math.min(selectionStart.y, selectionEnd.y),
    width: Math.abs(selectionEnd.x - selectionStart.x),
    height: Math.abs(selectionEnd.y - selectionStart.y)
  } : null;

  return {
    isSelecting,
    selectionRect,
    startSelection,
    updateSelection,
    endSelection
  };
};
