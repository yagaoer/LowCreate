// 工作流编辑器的核心数据类型定义

import { CSSProperties } from 'react';

// 节点类型枚举
export enum NodeType {
  INPUT = 'input',
  AGENT = 'agent', 
  CONDITION = 'condition',
  OUTPUT = 'output',
  TRANSFORM = 'transform',
  DELAY = 'delay',
  PARALLEL = 'parallel',
  MERGE = 'merge'
}

// 连接线类型
export enum ConnectionType {
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'error',
  CONDITION_TRUE = 'condition_true',
  CONDITION_FALSE = 'condition_false'
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 尺寸接口
export interface Size {
  width: number;
  height: number;
}

// 端点接口
export interface NodePort {
  id: string;
  type: 'input' | 'output';
  label: string;
  dataType?: string;
  required?: boolean;
}

// 节点数据基础接口
interface BaseNodeData {
  label: string;
  description?: string;
}

// 输入节点数据
export interface InputNodeData extends BaseNodeData {
  inputType: 'text' | 'number' | 'file' | 'json';
  defaultValue?: any;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// 智能体节点数据
export interface AgentNodeData extends BaseNodeData {
  agentType: 'llm' | 'function' | 'tool';
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  functions?: any[];
}

// 条件节点数据
export interface ConditionNodeData extends BaseNodeData {
  condition: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'regex';
  value: any;
}

// 输出节点数据
export interface OutputNodeData extends BaseNodeData {
  outputType: 'json' | 'text' | 'file' | 'webhook';
  format?: string;
  target?: string;
}

// 转换节点数据
export interface TransformNodeData extends BaseNodeData {
  transformation: 'map' | 'filter' | 'reduce' | 'sort' | 'custom';
  script: string;
  language?: 'javascript' | 'python';
}

// 延时节点数据
export interface DelayNodeData extends BaseNodeData {
  duration: number;
  unit: 'ms' | 's' | 'm' | 'h';
}

// 并行节点数据
export interface ParallelNodeData extends BaseNodeData {
  maxConcurrency: number;
  strategy: 'all' | 'race' | 'allSettled';
}

// 合并节点数据
export interface MergeNodeData extends BaseNodeData {
  strategy: 'waitAll' | 'first' | 'latest';
  timeout?: number;
}

// 联合节点数据类型
export type NodeData = 
  | InputNodeData 
  | AgentNodeData 
  | ConditionNodeData 
  | OutputNodeData 
  | TransformNodeData 
  | DelayNodeData 
  | ParallelNodeData 
  | MergeNodeData;

// 节点接口
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  size: Size;
  data: NodeData;
  ports: {
    inputs: NodePort[];
    outputs: NodePort[];
  };
  style?: CSSProperties;
  selected?: boolean;
  dragging?: boolean;
  visible?: boolean;
}

// 连接线接口
export interface WorkflowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort: string;
  targetPort: string;
  type: ConnectionType;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  selected?: boolean;
}

// 画布状态接口
export interface CanvasState {
  zoom: number;
  position: Position;
  size: Size;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

// 工作流元数据接口
export interface WorkflowMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  permissions: 'private' | 'public' | 'team';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 工作流接口
export interface Workflow {
  id: string;
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  canvas: CanvasState;
}

// 命令模式接口（用于撤销/重做）
export interface Command {
  id: string;
  type: string;
  data: any;
  undo?: () => void;
  redo?: () => void;
  timestamp: number;
}

// 历史状态接口
export interface HistoryState {
  past: Command[];
  future: Command[];
  maxHistory: number;
}

// 编辑器状态接口
export interface EditorState {
  workflow: Workflow;
  selectedNodes: string[];
  selectedConnections: string[];
  clipboard: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  } | null;
  history: HistoryState;
  isLoading: boolean;
  error: string | null;
}

// 搜索结果接口
export interface SearchResult {
  id: string;
  type: 'node' | 'template';
  title: string;
  description: string;
  category: string;
  tags: string[];
  nodeType?: NodeType;
}

// 节点模板接口
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  nodeType: NodeType;
  category: string;
  tags: string[];
  defaultData: Partial<NodeData>;
  icon?: string;
}
