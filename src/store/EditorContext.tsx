import React, { createContext, useContext, useReducer } from 'react';
import { ComponentData, HistoryState } from '../utils/componentTypes';
import { ActionTypes } from '../utils/constants';
import { deepCopy, findAndUpdate, findAndRemove } from '../utils/helper';

// 编辑器状态
interface EditorState {
  components: ComponentData[];
  selectedId: string | null;
  history: HistoryState;
  clipboard: ComponentData | null;
}

// 编辑器操作
type EditorAction =
  | { type: 'ADD_COMPONENT'; component: ComponentData }
  | { type: 'UPDATE_COMPONENT'; id: string; props: Record<string, any> }
  | { type: 'DELETE_COMPONENT'; id: string }
  | { type: 'MOVE_COMPONENT'; id: string; targetIndex: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_SELECTED_ID'; id: string | null }
  | { type: 'SET_CLIPBOARD'; component: ComponentData | null };

// 初始状态
const initialState: EditorState = {
  components: [],
  selectedId: null,
  history: {
    past: [],
    present: [],
    future: [],
    maxHistory: 20,
  },
  clipboard: null,
};

// 编辑器状态上下文
const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// 编辑器状态Reducer
const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'ADD_COMPONENT': {
      const newComponents = [...state.components, action.component];
      return {
        ...state,
        components: newComponents,
        history: pushHistory(state.history, newComponents),
      };
    }
    case 'UPDATE_COMPONENT': {
      const newComponents = findAndUpdate(
        state.components,
        action.id,
        (component) => ({
          ...component,
          props: { ...component.props, ...action.props },
        })
      );
      return {
        ...state,
        components: newComponents,
        history: pushHistory(state.history, newComponents),
      };
    }
    case 'DELETE_COMPONENT': {
      const newComponents = findAndRemove(state.components, action.id);
      return {
        ...state,
        components: newComponents,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        history: pushHistory(state.history, newComponents),
      };
    }
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
    case 'REDO': {
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);

      return {
        ...state,
        components: next,
        history: {
          past: [...state.history.past, state.components],
          present: next,
          future: newFuture,
          maxHistory: state.history.maxHistory,
        },
      };
    }
    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: {
          past: [],
          present: state.components,
          future: [],
          maxHistory: state.history.maxHistory,
        },
      };
    }
    case 'SET_SELECTED_ID': {
      return {
        ...state,
        selectedId: action.id,
      };
    }
    case 'SET_CLIPBOARD': {
      return {
        ...state,
        clipboard: action.component,
      };
    }
    default:
      return state;
  }
};

// 添加历史记录
const pushHistory = (
  history: HistoryState,
  components: ComponentData[]
): HistoryState => {
  // 深拷贝当前组件状态，避免引用问题
  const newComponents = deepCopy(components);

  return {
    past: [...history.past, history.present].slice(-history.maxHistory),
    present: newComponents,
    future: [],
    maxHistory: history.maxHistory,
  };
};

// 编辑器状态提供者
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};

// 编辑器状态Hook
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};