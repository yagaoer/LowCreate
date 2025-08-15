import { RefObject } from 'react';

declare module 'react-dnd' {
  export interface ConnectDragSource {
    (elementOrNode: any, options?: any): any;
  }
  
  export interface ConnectDropTarget {
    (elementOrNode: any, options?: any): any;
  }
}

// 扩展全局类型
declare global {
  namespace ReactDnD {
    interface DragSourceConnector {
      dragSource(): RefObject<any>;
    }
    
    interface DropTargetConnector {
      dropTarget(): RefObject<any>;
    }
  }
} 