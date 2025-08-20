import { useEffect } from 'react';
import hotkeys from 'hotkeys-js';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  selectSelectedNodes, 
  selectClipboard, 
  selectCanUndo, 
  selectCanRedo 
} from '../store';
import {
  undo,
  redo,
  copyToClipboard,
  pasteFromClipboard,
  deleteNode,
  clearSelection
} from '../store/workflowSlice';

export const useKeyboardShortcut = () => {
  const dispatch = useAppDispatch();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const clipboard = useAppSelector(selectClipboard);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  useEffect(() => {
    // 复制 (Ctrl+C)
    hotkeys('ctrl+c,command+c', (event) => {
      event.preventDefault();
      
      if (selectedNodes.length > 0) {
        dispatch(copyToClipboard());
      }
    });

    // 粘贴 (Ctrl+V)
    hotkeys('ctrl+v,command+v', (event) => {
      event.preventDefault();
      
      if (clipboard) {
        const pastePosition = { x: 100, y: 100 }; // 默认粘贴位置
        dispatch(pasteFromClipboard(pastePosition));
      }
    });

    // 删除 (Delete/Backspace)
    hotkeys('delete,backspace', (event) => {
      event.preventDefault();
      
      selectedNodes.forEach(nodeId => {
        dispatch(deleteNode(nodeId));
      });
    });

    // 撤销 (Ctrl+Z)
    hotkeys('ctrl+z,command+z', (event) => {
      event.preventDefault();
      
      if (canUndo) {
        dispatch(undo());
      }
    });

    // 重做 (Ctrl+Shift+Z)
    hotkeys('ctrl+shift+z,command+shift+z', (event) => {
      event.preventDefault();
      
      if (canRedo) {
        dispatch(redo());
      }
    });

    // 全选 (Ctrl+A)
    hotkeys('ctrl+a,command+a', (event) => {
      event.preventDefault();
      // 这里可以实现全选功能
    });

    // 清除选择 (Escape)
    hotkeys('escape', (event) => {
      event.preventDefault();
      dispatch(clearSelection());
    });

    // 清理函数
    return () => {
      hotkeys.unbind('ctrl+c,command+c');
      hotkeys.unbind('ctrl+v,command+v');
      hotkeys.unbind('delete,backspace');
      hotkeys.unbind('ctrl+z,command+z');
      hotkeys.unbind('ctrl+shift+z,command+shift+z');
      hotkeys.unbind('ctrl+a,command+a');
      hotkeys.unbind('escape');
    };
  }, [dispatch, selectedNodes, clipboard, canUndo, canRedo]);

  return null;
};