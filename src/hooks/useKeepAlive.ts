import { useState, useEffect } from 'react';
import { ComponentData } from '../utils/componentTypes';

// 定义缓存类型
type CacheType = {
  [key: string]: {
    components: ComponentData[];
    selectedId: string | null;
  };
};

// 全局缓存对象
const CACHE: CacheType = {};

/**
 * KeepAlive Hook - 用于在路由切换时保存和恢复编辑器状态
 * @param pageKey 页面唯一标识
 * @param components 当前组件数据
 * @param selectedId 当前选中组件ID
 * @returns 恢复的组件数据和选中ID
 */
export const useKeepAlive = (
  pageKey: string,
  components: ComponentData[],
  selectedId: string | null
) => {
  // 用于控制是否应该从缓存恢复状态
  const [shouldRestore, setShouldRestore] = useState(true);
  
  // 用于存储恢复后的状态
  const [restoredState, setRestoredState] = useState({
    components,
    selectedId,
  });

  // 当组件卸载或切换路由时，保存当前状态到缓存
  useEffect(() => {
    return () => {
      if (!shouldRestore) return;

      CACHE[pageKey] = {
        components,
        selectedId,
      };
    };
  }, [pageKey, components, selectedId, shouldRestore]);

  // 在组件挂载时尝试从缓存恢复状态
  useEffect(() => {
    const cachedData = CACHE[pageKey];
    if (cachedData && shouldRestore) {
      setRestoredState({
        components: cachedData.components,
        selectedId: cachedData.selectedId,
      });
      setShouldRestore(false);
    } else {
      setShouldRestore(false);
    }
  }, [pageKey, shouldRestore]);

  return {
    restoredComponents: restoredState.components,
    restoredSelectedId: restoredState.selectedId,
    clearCache: () => {
      delete CACHE[pageKey];
    }
  };
}; 