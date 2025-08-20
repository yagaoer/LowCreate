import { v4 as uuidv4 } from 'uuid';
import { 
  NodeType, 
  WorkflowNode, 
  Position, 
  Size, 
  NodeData,
  InputNodeData,
  AgentNodeData,
  ConditionNodeData,
  OutputNodeData,
  TransformNodeData,
  DelayNodeData,
  ParallelNodeData,
  MergeNodeData,
  Workflow,
  NodePort
} from '../types/workflow';

// 生成唯一ID
export const generateId = (): string => {
  return uuidv4();
};

// 创建默认节点端口
const createDefaultPorts = (nodeType: NodeType): { inputs: NodePort[]; outputs: NodePort[] } => {
  const commonOutput: NodePort = {
    id: 'output',
    type: 'output',
    label: '输出',
    dataType: 'any'
  };

  const commonInput: NodePort = {
    id: 'input',
    type: 'input',
    label: '输入',
    dataType: 'any',
    required: false
  };

  switch (nodeType) {
    case NodeType.INPUT:
      return {
        inputs: [],
        outputs: [commonOutput]
      };
    
    case NodeType.OUTPUT:
      return {
        inputs: [commonInput],
        outputs: []
      };
    
    case NodeType.CONDITION:
      return {
        inputs: [commonInput],
        outputs: [
          { id: 'true', type: 'output', label: '真', dataType: 'any' },
          { id: 'false', type: 'output', label: '假', dataType: 'any' }
        ]
      };
    
    case NodeType.PARALLEL:
      return {
        inputs: [commonInput],
        outputs: [
          { id: 'success', type: 'output', label: '成功', dataType: 'any' },
          { id: 'error', type: 'output', label: '错误', dataType: 'any' }
        ]
      };
    
    case NodeType.MERGE:
      return {
        inputs: [
          { id: 'input1', type: 'input', label: '输入1', dataType: 'any' },
          { id: 'input2', type: 'input', label: '输入2', dataType: 'any' }
        ],
        outputs: [commonOutput]
      };
    
    default:
      return {
        inputs: [commonInput],
        outputs: [commonOutput]
      };
  }
};

// 创建默认节点数据
const createDefaultNodeData = (nodeType: NodeType): NodeData => {
  switch (nodeType) {
    case NodeType.INPUT:
      return {
        label: '输入节点',
        description: '用于接收外部输入数据',
        inputType: 'text',
        defaultValue: '',
        required: true,
        validation: {
          pattern: '',
          min: 0,
          max: 1000
        }
      } as InputNodeData;

    case NodeType.AGENT:
      return {
        label: '智能体节点',
        description: '调用AI模型处理数据',
        agentType: 'llm',
        model: 'gpt-3.5-turbo',
        prompt: '请处理以下输入：',
        temperature: 0.7,
        maxTokens: 1000,
        functions: []
      } as AgentNodeData;

    case NodeType.CONDITION:
      return {
        label: '条件节点',
        description: '根据条件进行分支判断',
        condition: '',
        operator: 'equals',
        value: ''
      } as ConditionNodeData;

    case NodeType.OUTPUT:
      return {
        label: '输出节点',
        description: '输出处理结果',
        outputType: 'json',
        format: '',
        target: ''
      } as OutputNodeData;

    case NodeType.TRANSFORM:
      return {
        label: '转换节点',
        description: '对数据进行转换处理',
        transformation: 'map',
        script: '// 在这里编写转换逻辑\nreturn input;',
        language: 'javascript'
      } as TransformNodeData;

    case NodeType.DELAY:
      return {
        label: '延时节点',
        description: '延时指定时间后继续执行',
        duration: 1000,
        unit: 'ms'
      } as DelayNodeData;

    case NodeType.PARALLEL:
      return {
        label: '并行节点',
        description: '并行处理多个任务',
        maxConcurrency: 3,
        strategy: 'all'
      } as ParallelNodeData;

    case NodeType.MERGE:
      return {
        label: '合并节点',
        description: '合并多个输入流',
        strategy: 'waitAll',
        timeout: 30000
      } as MergeNodeData;

    default:
      return {
        label: '未知节点',
        description: ''
      } as NodeData;
  }
};

// 获取节点默认样式
const getNodeDefaultStyle = (nodeType: NodeType) => {
  const baseStyle = {
    borderRadius: '8px',
    border: '2px solid',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  };

  const typeStyles = {
    [NodeType.INPUT]: { borderColor: '#52c41a', background: '#f6ffed' },
    [NodeType.AGENT]: { borderColor: '#1890ff', background: '#f0f8ff' },
    [NodeType.CONDITION]: { borderColor: '#faad14', background: '#fffbe6' },
    [NodeType.OUTPUT]: { borderColor: '#f5222d', background: '#fff2f0' },
    [NodeType.TRANSFORM]: { borderColor: '#722ed1', background: '#f9f0ff' },
    [NodeType.DELAY]: { borderColor: '#13c2c2', background: '#e6fffb' },
    [NodeType.PARALLEL]: { borderColor: '#eb2f96', background: '#fff0f6' },
    [NodeType.MERGE]: { borderColor: '#fa8c16', background: '#fff7e6' }
  };

  return { ...baseStyle, ...typeStyles[nodeType] };
};

// 获取节点默认尺寸
const getNodeDefaultSize = (nodeType: NodeType): Size => {
  switch (nodeType) {
    case NodeType.INPUT:
    case NodeType.OUTPUT:
      return { width: 180, height: 100 };
    
    case NodeType.CONDITION:
      return { width: 200, height: 120 };
    
    case NodeType.AGENT:
      return { width: 220, height: 140 };
    
    case NodeType.TRANSFORM:
      return { width: 200, height: 130 };
    
    case NodeType.PARALLEL:
    case NodeType.MERGE:
      return { width: 180, height: 110 };
    
    default:
      return { width: 200, height: 120 };
  }
};

// 创建默认节点
export const createDefaultNode = (nodeType: NodeType, position: Position = { x: 100, y: 100 }): WorkflowNode => {
  return {
    id: generateId(),
    type: nodeType,
    position,
    size: getNodeDefaultSize(nodeType),
    data: createDefaultNodeData(nodeType),
    ports: createDefaultPorts(nodeType),
    style: getNodeDefaultStyle(nodeType),
    selected: false,
    dragging: false,
    visible: true
  };
};

// 创建默认工作流
export const createDefaultWorkflow = (): Workflow => {
  return {
    id: generateId(),
    metadata: {
      name: '新建工作流',
      description: '这是一个新建的工作流',
      version: '1.0.0',
      author: '',
      permissions: 'private',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    nodes: [],
    connections: [],
    canvas: {
      zoom: 1,
      position: { x: 0, y: 0 },
      size: { width: 5000, height: 5000 },
      gridSize: 20,
      showGrid: true,
      snapToGrid: false
    }
  };
};

// 节点位置工具函数
export const getNodeCenter = (node: WorkflowNode): Position => {
  return {
    x: node.position.x + node.size.width / 2,
    y: node.position.y + node.size.height / 2
  };
};

export const isPointInNode = (point: Position, node: WorkflowNode): boolean => {
  return (
    point.x >= node.position.x &&
    point.x <= node.position.x + node.size.width &&
    point.y >= node.position.y &&
    point.y <= node.position.y + node.size.height
  );
};

export const getNodeBounds = (nodes: WorkflowNode[]): { min: Position; max: Position } => {
  if (nodes.length === 0) {
    return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + node.size.width);
    maxY = Math.max(maxY, node.position.y + node.size.height);
  });

  return {
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY }
  };
};

// 坐标转换工具函数
export const screenToCanvas = (screenPos: Position, canvasPos: Position, zoom: number): Position => {
  return {
    x: (screenPos.x - canvasPos.x) / zoom,
    y: (screenPos.y - canvasPos.y) / zoom
  };
};

export const canvasToScreen = (canvasPos: Position, canvasOffset: Position, zoom: number): Position => {
  return {
    x: canvasPos.x * zoom + canvasOffset.x,
    y: canvasPos.y * zoom + canvasOffset.y
  };
};

// 距离计算
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

// 角度计算
export const calculateAngle = (from: Position, to: Position): number => {
  return Math.atan2(to.y - from.y, to.x - from.x);
};

// 网格对齐
export const snapToGrid = (position: Position, gridSize: number): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

// 边界检查
export const clampPosition = (position: Position, bounds: { min: Position; max: Position }): Position => {
  return {
    x: Math.max(bounds.min.x, Math.min(bounds.max.x, position.x)),
    y: Math.max(bounds.min.y, Math.min(bounds.max.y, position.y))
  };
};

// 数据验证工具
export const validateNodeData = (nodeType: NodeType, data: NodeData): boolean => {
  switch (nodeType) {
    case NodeType.INPUT:
      const inputData = data as InputNodeData;
      return !!inputData.label && !!inputData.inputType;
    
    case NodeType.AGENT:
      const agentData = data as AgentNodeData;
      return !!agentData.label && !!agentData.agentType;
    
    case NodeType.CONDITION:
      const conditionData = data as ConditionNodeData;
      return !!conditionData.label && !!conditionData.condition && !!conditionData.operator;
    
    default:
      return !!data.label;
  }
};

// 搜索工具
export const searchNodes = (nodes: WorkflowNode[], query: string): WorkflowNode[] => {
  if (!query.trim()) return nodes;
  
  const lowerQuery = query.toLowerCase();
  return nodes.filter(node => 
    node.data.label.toLowerCase().includes(lowerQuery) ||
    (node.data.description && node.data.description.toLowerCase().includes(lowerQuery)) ||
    node.type.toLowerCase().includes(lowerQuery)
  );
};

// JSON 导出/导入工具
export const exportWorkflowToJSON = (workflow: Workflow): string => {
  return JSON.stringify(workflow, null, 2);
};

export const importWorkflowFromJSON = (jsonString: string): Workflow | null => {
  try {
    const workflow = JSON.parse(jsonString) as Workflow;
    
    // 验证基本结构
    if (!workflow.id || !workflow.metadata || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.connections)) {
      throw new Error('Invalid workflow structure');
    }
    
    return workflow;
  } catch (error) {
    console.error('Failed to import workflow:', error);
    return null;
  }
};