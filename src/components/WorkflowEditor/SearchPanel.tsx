import React, { useState } from 'react';
import { Card, Input, List, Typography, Space, Button, Tag, Empty } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useSearch } from '../../hooks/useSearch';

const { Title, Text } = Typography;
const { Search } = Input;

interface SearchPanelProps {
  onClose: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onClose }) => {
  const { 
    query, 
    results, 
    isSearching, 
    search, 
    clearSearch, 
    getSuggestions,
    getPopularSearches 
  } = useSearch();
  
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    search(value);
    if (value.trim()) {
      setSuggestions(getSuggestions(value));
    } else {
      setSuggestions([]);
    }
  };

  const popularSearches = getPopularSearches();

  return (
    <Card 
      size="small"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: '#fff'
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <SearchOutlined />
            <span>搜索节点</span>
          </Space>
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} size="small" />
        </div>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="搜索节点类型、功能或关键词..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          loading={isSearching}
          allowClear
        />
      </div>

      {/* 搜索建议 */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#999', marginBottom: '8px', display: 'block' }}>
            搜索建议:
          </Text>
          <Space wrap>
            {suggestions.map((suggestion, index) => (
              <Tag 
                key={index}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearch(suggestion)}
              >
                {suggestion}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* 热门搜索 */}
      {!query && (
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#999', marginBottom: '8px', display: 'block' }}>
            热门搜索:
          </Text>
          <Space wrap>
            {popularSearches.map((term, index) => (
              <Tag 
                key={index}
                color="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearch(term)}
              >
                {term}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* 搜索结果 */}
      {query && (
        <div>
          <Text style={{ fontSize: '12px', color: '#999', marginBottom: '8px', display: 'block' }}>
            搜索结果 ({results.length}):
          </Text>
          
          {results.length > 0 ? (
            <List
              size="small"
              dataSource={results}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: '13px' }}>
                          {item.title}
                        </Text>
                        <Tag color="blue" style={{ fontSize: '10px' }}>
                          {item.category}
                        </Tag>
                      </div>
                    }
                    description={
                      <Text style={{ fontSize: '11px', color: '#666' }}>
                        {item.description}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="未找到相关节点"
              style={{ marginTop: '40px' }}
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default SearchPanel;
