import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import workflowReducer from './workflowSlice';

// 配置store
export const store = configureStore({
  reducer: {
    workflow: workflowReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些 action types 的序列化检查
        ignoredActions: ['workflow/undo', 'workflow/redo'],
        // 忽略这些 field paths 的序列化检查
        ignoredActionsPaths: ['payload.undo', 'payload.redo'],
        ignoredPaths: ['workflow.history.past', 'workflow.history.future'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 定义类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 类型化的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 选择器函数
export const selectWorkflow = (state: RootState) => state.workflow.workflow;
export const selectNodes = (state: RootState) => state.workflow.workflow.nodes;
export const selectConnections = (state: RootState) => state.workflow.workflow.connections;
export const selectSelectedNodes = (state: RootState) => state.workflow.selectedNodes;
export const selectSelectedConnections = (state: RootState) => state.workflow.selectedConnections;
export const selectCanvas = (state: RootState) => state.workflow.workflow.canvas;
export const selectHistory = (state: RootState) => state.workflow.history;
export const selectClipboard = (state: RootState) => state.workflow.clipboard;
export const selectIsLoading = (state: RootState) => state.workflow.isLoading;
export const selectError = (state: RootState) => state.workflow.error;

// 复合选择器
export const selectSelectedNodeObjects = (state: RootState) => {
  const nodes = selectNodes(state);
  const selectedIds = selectSelectedNodes(state);
  return nodes.filter(node => selectedIds.includes(node.id));
};

export const selectSelectedConnectionObjects = (state: RootState) => {
  const connections = selectConnections(state);
  const selectedIds = selectSelectedConnections(state);
  return connections.filter(conn => selectedIds.includes(conn.id));
};

export const selectNodeById = (id: string) => (state: RootState) => {
  return selectNodes(state).find(node => node.id === id);
};

export const selectConnectionById = (id: string) => (state: RootState) => {
  return selectConnections(state).find(conn => conn.id === id);
};

export const selectCanUndo = (state: RootState) => {
  return selectHistory(state).past.length > 0;
};

export const selectCanRedo = (state: RootState) => {
  return selectHistory(state).future.length > 0;
};

export const selectConnectedNodes = (nodeId: string) => (state: RootState) => {
  const connections = selectConnections(state);
  const nodes = selectNodes(state);
  
  const connectedNodeIds = new Set<string>();
  
  connections.forEach(conn => {
    if (conn.sourceId === nodeId) {
      connectedNodeIds.add(conn.targetId);
    }
    if (conn.targetId === nodeId) {
      connectedNodeIds.add(conn.sourceId);
    }
  });
  
  return nodes.filter(node => connectedNodeIds.has(node.id));
};

export const selectNodeConnections = (nodeId: string) => (state: RootState) => {
  const connections = selectConnections(state);
  return connections.filter(conn => conn.sourceId === nodeId || conn.targetId === nodeId);
};
