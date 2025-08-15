import { ComponentData, ComponentType } from './componentTypes';

// 生成唯一ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// 创建新组件
export const createComponent = (type: ComponentType): ComponentData => {
  const id = generateId();
  return {
    id,
    key: id,
    type,
    props: getDefaultProps(type),
  };
};

// 获取组件默认属性
export const getDefaultProps = (type: ComponentType): Record<string, any> => {
  switch (type) {
    case ComponentType.TEXT:
      return { content: '文本组件', fontSize: 14 };
    case ComponentType.BUTTON:
      return { text: '按钮', type: 'primary' };
    case ComponentType.IMAGE:
      return { src: 'https://via.placeholder.com/150', alt: '图片' };
    case ComponentType.CONTAINER:
      return { width: '100%', height: '200px' };
    case ComponentType.ROW:
      return { justify: 'start', align: 'middle' };
    case ComponentType.COLUMN:
      return { span: 12 };
    default:
      return {};
  }
};

// 深拷贝函数
export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// 查找并更新组件
export const findAndUpdate = (
  components: ComponentData[],
  id: string,
  updater: (component: ComponentData) => ComponentData
): ComponentData[] => {
  return components.map(component => {
    if (component.id === id) {
      return updater(component);
    }
    
    if (component.children && component.children.length > 0) {
      return {
        ...component,
        children: findAndUpdate(component.children, id, updater),
      };
    }
    
    return component;
  });
};

// 查找并删除组件
export const findAndRemove = (
  components: ComponentData[],
  id: string
): ComponentData[] => {
  return components
    .filter(component => component.id !== id)
    .map(component => {
      if (component.children && component.children.length > 0) {
        return {
          ...component,
          children: findAndRemove(component.children, id),
        };
      }
      return component;
    });
}; 