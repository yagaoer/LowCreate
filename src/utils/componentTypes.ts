export interface ComponentProps {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentData[];
  style?: React.CSSProperties;
}

export interface ComponentData extends ComponentProps {
  key: string;
}

// 预定义可用的组件类型
export enum ComponentType {
  TEXT = 'Text',
  BUTTON = 'Button',
  IMAGE = 'Image',
  CONTAINER = 'Container',
  ROW = 'Row',
  COLUMN = 'Column',
}

// 定义组件拖拽项的数据结构
export interface DragItem {
  type: string;
  id: string;
  componentType: ComponentType;
  text?: string;
}

// 定义画布中的历史记录数据结构
export interface HistoryRecord {
  components: ComponentData[];
  currentIndex: number;
}

export interface HistoryState {
  past: ComponentData[][];
  present: ComponentData[];
  future: ComponentData[][];
  maxHistory: number;
} 