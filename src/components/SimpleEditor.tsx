import React from 'react';
import { Layout, Button, Typography, Card, Row, Col, Space } from 'antd';
import { useAppSelector, useAppDispatch } from '../store';
import { selectNodes, selectCanvas } from '../store';
import { addNode } from '../store/workflowSlice';
import { NodeType } from '../types/workflow';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const SimpleEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const canvas = useAppSelector(selectCanvas);

  const handleAddNode = (nodeType: NodeType) => {
    dispatch(addNode({
      type: nodeType,
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      }
    }));
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          🚀 简化版工作流编辑器
        </Title>
      </Header>
      
      <Layout>
        <Sider width={250} theme="light" style={{ padding: '16px' }}>
          <Title level={4}>添加节点</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              block 
              onClick={() => handleAddNode(NodeType.INPUT)}
            >
              📝 输入节点
            </Button>
            <Button 
              block 
              onClick={() => handleAddNode(NodeType.AGENT)}
            >
              🤖 智能体节点
            </Button>
            <Button 
              block 
              onClick={() => handleAddNode(NodeType.CONDITION)}
            >
              🔀 条件节点
            </Button>
            <Button 
              block 
              onClick={() => handleAddNode(NodeType.OUTPUT)}
            >
              📄 输出节点
            </Button>
          </Space>
          
          <div style={{ marginTop: '20px' }}>
            <Text>当前节点数: {nodes.length}</Text>
          </div>
        </Sider>
        
        <Content style={{ padding: '16px', background: '#f5f5f5' }}>
          <Card 
            title="画布" 
            style={{ height: '100%' }}
            bodyStyle={{ 
              height: 'calc(100% - 57px)', 
              overflow: 'auto',
              position: 'relative'
            }}
          >
            <div style={{ 
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: '400px'
            }}>
              {nodes.length === 0 ? (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <Title level={4} style={{ color: '#999' }}>
                    点击左侧按钮添加节点
                  </Title>
                </div>
              ) : (
                nodes.map((node) => (
                  <div
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: node.position.x,
                      top: node.position.y,
                      width: node.size.width,
                      height: node.size.height,
                    }}
                  >
                    <Card 
                      size="small"
                      title={
                        <Space>
                          <span>
                            {node.type === NodeType.INPUT && '📝'}
                            {node.type === NodeType.AGENT && '🤖'}
                            {node.type === NodeType.CONDITION && '🔀'}
                            {node.type === NodeType.OUTPUT && '📄'}
                          </span>
                          <Text strong>{node.data.label}</Text>
                        </Space>
                      }
                      style={{
                        width: '100%',
                        height: '100%',
                        ...node.style
                      }}
                    >
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        ID: {node.id.substring(0, 8)}...
                      </Text>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SimpleEditor;
