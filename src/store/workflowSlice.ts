import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  EditorState, 
  Workflow, 
  WorkflowNode, 
  WorkflowConnection, 
  NodeType, 
  Position,
  Command,
  CanvasState
} from '../types/workflow';
import { generateId, createDefaultNode, createDefaultWorkflow } from '../utils/workflowHelpers';

// 初始状态
const initialState: EditorState = {
  workflow: createDefaultWorkflow(),
  selectedNodes: [],
  selectedConnections: [],
  clipboard: null,
  history: {
    past: [],
    future: [],
    maxHistory: 50
  },
  isLoading: false,
  error: null
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    // 基础操作
    setWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflow = action.payload;
      state.selectedNodes = [];
      state.selectedConnections = [];
    },

    updateWorkflowMetadata: (state, action: PayloadAction<Partial<typeof state.workflow.metadata>>) => {
      state.workflow.metadata = { ...state.workflow.metadata, ...action.payload };
      state.workflow.metadata.updatedAt = new Date().toISOString();
    },

    // 节点操作
    addNode: (state, action: PayloadAction<{ type: NodeType; position: Position }>) => {
      const newNode = createDefaultNode(action.payload.type, action.payload.position);
      state.workflow.nodes.push(newNode);
      
      // 记录命令用于撤销
      const command: Command = {
        id: generateId(),
        type: 'ADD_NODE',
        data: { nodeId: newNode.id },
        timestamp: Date.now()
      };
      state.history.past.push(command);
      state.history.future = [];
      
      // 限制历史记录数量
      if (state.history.past.length > state.history.maxHistory) {
        state.history.past.shift();
      }
    },

    updateNode: (state, action: PayloadAction<{ id: string; updates: Partial<WorkflowNode> }>) => {
      const { id, updates } = action.payload;
      const nodeIndex = state.workflow.nodes.findIndex(node => node.id === id);
      if (nodeIndex !== -1) {
        const oldNode = { ...state.workflow.nodes[nodeIndex] };
        state.workflow.nodes[nodeIndex] = { ...state.workflow.nodes[nodeIndex], ...updates };
        
        // 记录命令用于撤销
        const command: Command = {
          id: generateId(),
          type: 'UPDATE_NODE',
          data: { nodeId: id, oldData: oldNode, newData: updates },
          timestamp: Date.now()
        };
        state.history.past.push(command);
        state.history.future = [];
      }
    },

    deleteNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const nodeIndex = state.workflow.nodes.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        const deletedNode = state.workflow.nodes[nodeIndex];
        state.workflow.nodes.splice(nodeIndex, 1);
        
        // 删除相关连接
        const deletedConnections = state.workflow.connections.filter(
          conn => conn.sourceId === nodeId || conn.targetId === nodeId
        );
        state.workflow.connections = state.workflow.connections.filter(
          conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
        );
        
        // 从选中列表中移除
        state.selectedNodes = state.selectedNodes.filter(id => id !== nodeId);
        
        // 记录命令用于撤销
        const command: Command = {
          id: generateId(),
          type: 'DELETE_NODE',
          data: { node: deletedNode, connections: deletedConnections },
          timestamp: Date.now()
        };
        state.history.past.push(command);
        state.history.future = [];
      }
    },

    duplicateNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const originalNode = state.workflow.nodes.find(node => node.id === nodeId);
      if (originalNode) {
        const newNode: WorkflowNode = {
          ...originalNode,
          id: generateId(),
          position: {
            x: originalNode.position.x + 50,
            y: originalNode.position.y + 50
          },
          selected: false
        };
        state.workflow.nodes.push(newNode);
        
        const command: Command = {
          id: generateId(),
          type: 'DUPLICATE_NODE',
          data: { originalId: nodeId, newNodeId: newNode.id },
          timestamp: Date.now()
        };
        state.history.past.push(command);
        state.history.future = [];
      }
    },

    // 连接操作
    addConnection: (state, action: PayloadAction<Omit<WorkflowConnection, 'id'>>) => {
      const newConnection: WorkflowConnection = {
        ...action.payload,
        id: generateId()
      };
      
      // 检查是否已存在相同连接
      const existingConnection = state.workflow.connections.find(
        conn => conn.sourceId === newConnection.sourceId && 
                conn.targetId === newConnection.targetId &&
                conn.sourcePort === newConnection.sourcePort &&
                conn.targetPort === newConnection.targetPort
      );
      
      if (!existingConnection) {
        state.workflow.connections.push(newConnection);
        
        const command: Command = {
          id: generateId(),
          type: 'ADD_CONNECTION',
          data: { connectionId: newConnection.id },
          timestamp: Date.now()
        };
        state.history.past.push(command);
        state.history.future = [];
      }
    },

    deleteConnection: (state, action: PayloadAction<string>) => {
      const connectionId = action.payload;
      const connectionIndex = state.workflow.connections.findIndex(conn => conn.id === connectionId);
      if (connectionIndex !== -1) {
        const deletedConnection = state.workflow.connections[connectionIndex];
        state.workflow.connections.splice(connectionIndex, 1);
        
        state.selectedConnections = state.selectedConnections.filter(id => id !== connectionId);
        
        const command: Command = {
          id: generateId(),
          type: 'DELETE_CONNECTION',
          data: { connection: deletedConnection },
          timestamp: Date.now()
        };
        state.history.past.push(command);
        state.history.future = [];
      }
    },

    // 选择操作
    selectNode: (state, action: PayloadAction<{ nodeId: string; multi?: boolean }>) => {
      const { nodeId, multi = false } = action.payload;
      
      if (multi) {
        if (state.selectedNodes.includes(nodeId)) {
          state.selectedNodes = state.selectedNodes.filter(id => id !== nodeId);
        } else {
          state.selectedNodes.push(nodeId);
        }
      } else {
        state.selectedNodes = [nodeId];
      }
      
      // 清除连接选择
      state.selectedConnections = [];
      
      // 更新节点选中状态
      state.workflow.nodes.forEach(node => {
        node.selected = state.selectedNodes.includes(node.id);
      });
    },

    selectConnection: (state, action: PayloadAction<{ connectionId: string; multi?: boolean }>) => {
      const { connectionId, multi = false } = action.payload;
      
      if (multi) {
        if (state.selectedConnections.includes(connectionId)) {
          state.selectedConnections = state.selectedConnections.filter(id => id !== connectionId);
        } else {
          state.selectedConnections.push(connectionId);
        }
      } else {
        state.selectedConnections = [connectionId];
      }
      
      // 清除节点选择
      state.selectedNodes = [];
      state.workflow.nodes.forEach(node => {
        node.selected = false;
      });
      
      // 更新连接选中状态
      state.workflow.connections.forEach(conn => {
        conn.selected = state.selectedConnections.includes(conn.id);
      });
    },

    clearSelection: (state) => {
      state.selectedNodes = [];
      state.selectedConnections = [];
      state.workflow.nodes.forEach(node => {
        node.selected = false;
      });
      state.workflow.connections.forEach(conn => {
        conn.selected = false;
      });
    },

    selectArea: (state, action: PayloadAction<{ startPos: Position; endPos: Position }>) => {
      const { startPos, endPos } = action.payload;
      const minX = Math.min(startPos.x, endPos.x);
      const maxX = Math.max(startPos.x, endPos.x);
      const minY = Math.min(startPos.y, endPos.y);
      const maxY = Math.max(startPos.y, endPos.y);
      
      state.selectedNodes = state.workflow.nodes
        .filter(node => 
          node.position.x >= minX && 
          node.position.x + node.size.width <= maxX &&
          node.position.y >= minY && 
          node.position.y + node.size.height <= maxY
        )
        .map(node => node.id);
      
      state.workflow.nodes.forEach(node => {
        node.selected = state.selectedNodes.includes(node.id);
      });
    },

    // 画布操作
    updateCanvas: (state, action: PayloadAction<Partial<CanvasState>>) => {
      state.workflow.canvas = { ...state.workflow.canvas, ...action.payload };
    },

    zoomCanvas: (state, action: PayloadAction<{ zoom: number; center?: Position }>) => {
      const { zoom, center } = action.payload;
      const oldZoom = state.workflow.canvas.zoom;
      state.workflow.canvas.zoom = Math.max(0.1, Math.min(3, zoom));
      
      if (center) {
        // 根据缩放中心调整画布位置
        const zoomRatio = state.workflow.canvas.zoom / oldZoom;
        state.workflow.canvas.position.x = center.x - (center.x - state.workflow.canvas.position.x) * zoomRatio;
        state.workflow.canvas.position.y = center.y - (center.y - state.workflow.canvas.position.y) * zoomRatio;
      }
    },

    panCanvas: (state, action: PayloadAction<{ deltaX: number; deltaY: number }>) => {
      const { deltaX, deltaY } = action.payload;
      state.workflow.canvas.position.x += deltaX;
      state.workflow.canvas.position.y += deltaY;
    },

    // 剪贴板操作
    copyToClipboard: (state) => {
      const selectedNodes = state.workflow.nodes.filter(node => state.selectedNodes.includes(node.id));
      const selectedConnections = state.workflow.connections.filter(conn => 
        state.selectedConnections.includes(conn.id) ||
        (state.selectedNodes.includes(conn.sourceId) && state.selectedNodes.includes(conn.targetId))
      );
      
      state.clipboard = {
        nodes: selectedNodes,
        connections: selectedConnections
      };
    },

    pasteFromClipboard: (state, action: PayloadAction<Position>) => {
      if (!state.clipboard) return;
      
      const offset = action.payload;
      const idMapping: Record<string, string> = {};
      
      // 复制节点
      const newNodes = state.clipboard.nodes.map(node => {
        const newId = generateId();
        idMapping[node.id] = newId;
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offset.x,
            y: node.position.y + offset.y
          },
          selected: true
        };
      });
      
      // 复制连接
      const newConnections = state.clipboard.connections
        .filter(conn => idMapping[conn.sourceId] && idMapping[conn.targetId])
        .map(conn => ({
          ...conn,
          id: generateId(),
          sourceId: idMapping[conn.sourceId],
          targetId: idMapping[conn.targetId]
        }));
      
      state.workflow.nodes.push(...newNodes);
      state.workflow.connections.push(...newConnections);
      
      // 更新选择
      state.selectedNodes = newNodes.map(node => node.id);
      state.selectedConnections = [];
      
      const command: Command = {
        id: generateId(),
        type: 'PASTE',
        data: { nodeIds: newNodes.map(n => n.id), connectionIds: newConnections.map(c => c.id) },
        timestamp: Date.now()
      };
      state.history.past.push(command);
      state.history.future = [];
    },

    // 撤销/重做操作
    undo: (state) => {
      if (state.history.past.length === 0) return;
      
      const command = state.history.past.pop()!;
      state.history.future.unshift(command);
      
      // 执行撤销操作
      executeUndoCommand(state, command);
    },

    redo: (state) => {
      if (state.history.future.length === 0) return;
      
      const command = state.history.future.shift()!;
      state.history.past.push(command);
      
      // 执行重做操作
      executeRedoCommand(state, command);
    },

    // 错误处理
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

// 撤销命令执行函数
function executeUndoCommand(state: EditorState, command: Command) {
  switch (command.type) {
    case 'ADD_NODE':
      state.workflow.nodes = state.workflow.nodes.filter(node => node.id !== command.data.nodeId);
      break;
    
    case 'DELETE_NODE':
      state.workflow.nodes.push(command.data.node);
      state.workflow.connections.push(...command.data.connections);
      break;
    
    case 'UPDATE_NODE':
      const nodeIndex = state.workflow.nodes.findIndex(node => node.id === command.data.nodeId);
      if (nodeIndex !== -1) {
        state.workflow.nodes[nodeIndex] = command.data.oldData;
      }
      break;
    
    case 'ADD_CONNECTION':
      state.workflow.connections = state.workflow.connections.filter(conn => conn.id !== command.data.connectionId);
      break;
    
    case 'DELETE_CONNECTION':
      state.workflow.connections.push(command.data.connection);
      break;
  }
}

// 重做命令执行函数
function executeRedoCommand(state: EditorState, command: Command) {
  switch (command.type) {
    case 'ADD_NODE':
      // 重新添加节点需要重新创建，因为原始数据可能不完整
      break;
    
    case 'DELETE_NODE':
      state.workflow.nodes = state.workflow.nodes.filter(node => node.id !== command.data.node.id);
      state.workflow.connections = state.workflow.connections.filter(
        conn => conn.sourceId !== command.data.node.id && conn.targetId !== command.data.node.id
      );
      break;
    
    case 'UPDATE_NODE':
      const nodeIndex = state.workflow.nodes.findIndex(node => node.id === command.data.nodeId);
      if (nodeIndex !== -1) {
        state.workflow.nodes[nodeIndex] = { ...state.workflow.nodes[nodeIndex], ...command.data.newData };
      }
      break;
  }
}

export const {
  setWorkflow,
  updateWorkflowMetadata,
  addNode,
  updateNode,
  deleteNode,
  duplicateNode,
  addConnection,
  deleteConnection,
  selectNode,
  selectConnection,
  clearSelection,
  selectArea,
  updateCanvas,
  zoomCanvas,
  panCanvas,
  copyToClipboard,
  pasteFromClipboard,
  undo,
  redo,
  setError,
  setLoading
} = workflowSlice.actions;

export default workflowSlice.reducer;
