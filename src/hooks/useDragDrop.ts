import { useDrag, useDrop, ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { useEditor } from '../store/EditorContext';
import { ComponentData, DragItem, ComponentType } from '../utils/componentTypes';
import { ItemTypes } from '../utils/constants';
import { createComponent } from '../utils/helper';

// 组件面板组件的拖拽Hook
export const usePanelDrag = (componentType: ComponentType): {
  drag: ConnectDragSource;
  isDragging: boolean;
} => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { 
      type: ItemTypes.COMPONENT,
      componentType, 
      id: 'new',
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return { drag, isDragging };
};

// 画布中组件的拖拽Hook
export const useComponentDrag = (id: string, type: ComponentType): {
  drag: ConnectDragSource;
  isDragging: boolean;
} => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CANVAS_COMPONENT,
    item: { 
      type: ItemTypes.CANVAS_COMPONENT,
      id, 
      componentType: type,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, type]);

  return { drag, isDragging };
};

// 画布的放置Hook
export const useCanvasDrop = (): {
  drop: ConnectDropTarget;
  isOver: boolean;
} => {
  const { dispatch } = useEditor();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.CANVAS_COMPONENT],
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) {
        return;
      }

      // 如果是从组件面板拖过来的新组件
      if (item.type === ItemTypes.COMPONENT && item.id === 'new') {
        const newComponent = createComponent(item.componentType);
        dispatch({ 
          type: 'ADD_COMPONENT', 
          component: newComponent 
        });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [dispatch]);

  return { drop, isOver };
};

// 组件的放置Hook (用于处理嵌套组件)
export const useComponentDrop = (id: string, acceptChildren: boolean): {
  drop: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
} => {
  const { dispatch } = useEditor();
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.CANVAS_COMPONENT],
    canDrop: () => acceptChildren,
    drop: (item: DragItem) => {
      if (item.type === ItemTypes.COMPONENT && item.id === 'new') {
        const newComponent = createComponent(item.componentType);
        // 这里可以根据实际需求实现添加子组件的逻辑
        console.log(`添加子组件到 ${id}`, newComponent);
      } else if (item.type === ItemTypes.CANVAS_COMPONENT) {
        // 这里可以实现移动组件的逻辑
        console.log(`移动组件 ${item.id} 到 ${id}`);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }), [id, acceptChildren, dispatch]);

  return { drop, isOver, canDrop };
}; 