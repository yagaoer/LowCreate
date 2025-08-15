# LowCreate 低代码设计平台

一款可视化低代码编辑平台，可以通过线上拖拽组件实现宣传页面，同时支持预览功能。

## 技术栈

- React
- TypeScript
- Ant Design
- React DnD（拖拽功能）

## ✅ 主要功能

- 组件拖拽：基于React DnD实现组件从左侧面板拖拽到画布 ✅
- 属性编辑：右侧面板可以编辑选中组件的属性 ✅
- 画布操作：支持组件的移动、删除、复制粘贴等操作 ✅
- 快捷键支持：基于Hotkeys实现复制(Ctrl+C)、粘贴(Ctrl+V)、删除(Delete)等功能 ✅
- 撤销重做：实现了画布操作的撤销(Ctrl+Z)和重做(Ctrl+Shift+Z)功能 ✅
- 页面预览：支持编辑完成后的页面预览功能 ✅
- 状态保持：基于KeepAlive实现了路由切换后状态保持功能 ✅

## 🎯 核心技术实现

### 1. React DnD 拖拽实现

使用React DnD库实现拖拽功能，主要自定义了以下Hook:

- `usePanelDrag`: 用于组件面板元素的拖拽
- `useComponentDrag`: 用于画布中组件的拖拽
- `useCanvasDrop`: 处理画布的放置逻辑
- `useComponentDrop`: 处理组件内部的放置逻辑(用于嵌套组件)

拖拽的核心实现:
```typescript
// 组件面板拖拽Hook
export const usePanelDrag = (componentType: ComponentType) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { type: ItemTypes.COMPONENT, componentType, id: 'new' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return { drag, isDragging };
};

// 画布放置Hook
export const useCanvasDrop = () => {
  const { dispatch } = useEditor();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.CANVAS_COMPONENT],
    drop: (item: DragItem, monitor) => {
      if (item.type === ItemTypes.COMPONENT && item.id === 'new') {
        const newComponent = createComponent(item.componentType);
        dispatch({ type: 'ADD_COMPONENT', component: newComponent });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [dispatch]);

  return { drop, isOver };
};
```

### 2. 状态管理与历史记录设计

使用React Context API和useReducer实现了状态管理，关键设计点包括:

- 组件数据结构设计
- 历史记录状态结构设计
- 撤销重做功能实现

历史记录状态结构:
```typescript
export interface HistoryState {
  past: ComponentData[][];
  present: ComponentData[];
  future: ComponentData[][];
  maxHistory: number;
}
```

撤销功能实现:
```typescript
case 'UNDO': {
  if (state.history.past.length === 0) return state;
  const previous = state.history.past[state.history.past.length - 1];
  const newPast = state.history.past.slice(0, state.history.past.length - 1);

  return {
    ...state,
    components: previous,
    history: {
      past: newPast,
      present: previous,
      future: [state.components, ...state.history.future],
      maxHistory: state.history.maxHistory,
    },
  };
}
```

### 3. 快捷键实现

使用Hotkeys库实现了键盘快捷键，支持复制、粘贴、删除、撤销和重做功能:

```typescript
useEffect(() => {
  // 注册复制快捷键
  hotkeys(KeyboardShortcuts.COPY, (event) => {
    event.preventDefault();
    
    if (selectedId) {
      const selectedComponent = components.find(comp => comp.id === selectedId);
      if (selectedComponent) {
        const clonedComponent = deepCopy(selectedComponent);
        dispatch({ type: 'SET_CLIPBOARD', component: clonedComponent });
      }
    }
  });
  
  // 注册粘贴快捷键
  hotkeys(KeyboardShortcuts.PASTE, (event) => {
    event.preventDefault();
    
    if (clipboard) {
      const newComponent = deepCopy(clipboard);
      newComponent.id = `${newComponent.id}-copy-${Date.now()}`;
      newComponent.key = newComponent.id;
      
      dispatch({ type: 'ADD_COMPONENT', component: newComponent });
    }
  });

  // 更多快捷键...
}, [dispatch, selectedId, components, clipboard]);
```

### 4. KeepAlive 实现

实现了一个自定义的KeepAlive Hook，用于在路由切换后保持编辑器状态:

```typescript
export const useKeepAlive = (
  pageKey: string,
  components: ComponentData[],
  selectedId: string | null
) => {
  const [shouldRestore, setShouldRestore] = useState(true);
  const [restoredState, setRestoredState] = useState({
    components,
    selectedId,
  });

  // 当组件卸载时保存状态
  useEffect(() => {
    return () => {
      if (!shouldRestore) return;
      CACHE[pageKey] = { components, selectedId };
    };
  }, [pageKey, components, selectedId, shouldRestore]);

  // 在组件挂载时恢复状态
  useEffect(() => {
    const cachedData = CACHE[pageKey];
    if (cachedData && shouldRestore) {
      setRestoredState({
        components: cachedData.components,
        selectedId: cachedData.selectedId,
      });
      setShouldRestore(false);
    }
  }, [pageKey, shouldRestore]);

  return {
    restoredComponents: restoredState.components,
    restoredSelectedId: restoredState.selectedId,
    clearCache: () => { delete CACHE[pageKey]; }
  };
};
```

## 项目启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 项目结构

```
src/
├── components/         # 组件
│   ├── Canvas/         # 画布组件
│   ├── ComponentPanel/ # 组件面板
│   ├── Editor/         # 编辑器
│   └── PreviewPanel/   # 预览面板
├── hooks/              # 自定义钩子
│   ├── useDragDrop.ts  # 拖拽相关Hook
│   ├── useKeyboardShortcut.ts # 快捷键Hook
│   └── useKeepAlive.ts # 状态保持Hook
├── store/              # 状态管理
│   └── EditorContext.tsx # 编辑器上下文
└── utils/              # 工具函数
    ├── componentTypes.ts # 组件类型定义
    ├── constants.ts    # 常量定义
    └── helper.ts       # 辅助函数
```

## 🎯 优化思路：
1. **组件库扩展** - 添加更多业务组件
2. **性能监控** - 添加拖拽性能埋点
3. **插件化架构** - 支持自定义组件扩展
4. **协同编辑** - WebSocket实时协作功能

