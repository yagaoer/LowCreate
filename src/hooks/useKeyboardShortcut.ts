import { useEffect } from 'react';
import hotkeys from 'hotkeys-js';
import { useEditor } from '../store/EditorContext';
import { KeyboardShortcuts } from '../utils/constants';
import { deepCopy } from '../utils/helper';

export const useKeyboardShortcut = () => {
  const { state, dispatch } = useEditor();
  const { selectedId, components, clipboard } = state;

  useEffect(() => {
    // 注册复制快捷键
    hotkeys(KeyboardShortcuts.COPY, (event) => {
      event.preventDefault();
      
      if (selectedId) {
        const selectedComponent = components.find(comp => comp.id === selectedId);
        if (selectedComponent) {
          // 克隆选中的组件，并保存到剪贴板
          const clonedComponent = deepCopy(selectedComponent);
          dispatch({ type: 'SET_CLIPBOARD', component: clonedComponent });
        }
      }
    });

    // 注册粘贴快捷键
    hotkeys(KeyboardShortcuts.PASTE, (event) => {
      event.preventDefault();
      
      if (clipboard) {
        // 创建新组件，修改ID以避免ID冲突
        const newComponent = deepCopy(clipboard);
        newComponent.id = `${newComponent.id}-copy-${Date.now()}`;
        newComponent.key = newComponent.id;
        
        dispatch({ type: 'ADD_COMPONENT', component: newComponent });
      }
    });

    // 注册删除快捷键
    hotkeys(KeyboardShortcuts.DELETE, (event) => {
      event.preventDefault();
      
      if (selectedId) {
        dispatch({ type: 'DELETE_COMPONENT', id: selectedId });
      }
    });

    // 注册撤销快捷键
    hotkeys(KeyboardShortcuts.UNDO, (event) => {
      event.preventDefault();
      dispatch({ type: 'UNDO' });
    });

    // 注册重做快捷键
    hotkeys(KeyboardShortcuts.REDO, (event) => {
      event.preventDefault();
      dispatch({ type: 'REDO' });
    });

    return () => {
      // 清除所有快捷键绑定
      hotkeys.unbind(KeyboardShortcuts.COPY);
      hotkeys.unbind(KeyboardShortcuts.PASTE);
      hotkeys.unbind(KeyboardShortcuts.DELETE);
      hotkeys.unbind(KeyboardShortcuts.UNDO);
      hotkeys.unbind(KeyboardShortcuts.REDO);
    };
  }, [dispatch, selectedId, components, clipboard]);

  return null;
}; 