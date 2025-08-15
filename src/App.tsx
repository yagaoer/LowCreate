import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css'; // 导入Ant Design样式
import { EditorProvider } from './store/EditorContext';
import Editor from './components/Editor';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <EditorProvider>
        <Editor />
      </EditorProvider>
    </ConfigProvider>
  );
};

export default App;
