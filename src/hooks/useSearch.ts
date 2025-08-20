import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppSelector, selectNodes } from '../store';
import { WorkflowNode, NodeType, SearchResult, NodeTemplate } from '../types/workflow';
import { debounce } from 'lodash';

// 节点模板数据
const NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: 'template-input-text',
    name: '文本输入',
    description: '接收文本类型的输入数据',
    nodeType: NodeType.INPUT,
    category: '输入输出',
    tags: ['输入', '文本', 'input', 'text'],
    defaultData: {
      label: '文本输入',
      inputType: 'text',
      required: true
    },
    icon: '📝'
  },
  {
    id: 'template-input-file',
    name: '文件输入',
    description: '接收文件类型的输入数据',
    nodeType: NodeType.INPUT,
    category: '输入输出',
    tags: ['输入', '文件', 'input', 'file', 'upload'],
    defaultData: {
      label: '文件输入',
      inputType: 'file',
      required: true
    },
    icon: '📁'
  },
  {
    id: 'template-agent-llm',
    name: 'LLM智能体',
    description: '调用大语言模型处理文本',
    nodeType: NodeType.AGENT,
    category: '智能体',
    tags: ['智能体', 'AI', 'LLM', 'GPT', '文本处理'],
    defaultData: {
      label: 'LLM智能体',
      agentType: 'llm',
      model: 'gpt-3.5-turbo'
    },
    icon: '🤖'
  },
  {
    id: 'template-agent-function',
    name: '函数智能体',
    description: '调用自定义函数处理数据',
    nodeType: NodeType.AGENT,
    category: '智能体',
    tags: ['智能体', '函数', 'function', '自定义'],
    defaultData: {
      label: '函数智能体',
      agentType: 'function'
    },
    icon: '⚙️'
  },
  {
    id: 'template-condition-if',
    name: '条件判断',
    description: '根据条件进行分支控制',
    nodeType: NodeType.CONDITION,
    category: '逻辑控制',
    tags: ['条件', '判断', 'if', '分支', '控制'],
    defaultData: {
      label: '条件判断',
      operator: 'equals'
    },
    icon: '🔀'
  },
  {
    id: 'template-transform-map',
    name: '数据映射',
    description: '对数据进行映射转换',
    nodeType: NodeType.TRANSFORM,
    category: '数据处理',
    tags: ['转换', '映射', 'map', '数据处理'],
    defaultData: {
      label: '数据映射',
      transformation: 'map'
    },
    icon: '🔄'
  },
  {
    id: 'template-transform-filter',
    name: '数据过滤',
    description: '过滤符合条件的数据',
    nodeType: NodeType.TRANSFORM,
    category: '数据处理',
    tags: ['转换', '过滤', 'filter', '数据处理'],
    defaultData: {
      label: '数据过滤',
      transformation: 'filter'
    },
    icon: '🔍'
  },
  {
    id: 'template-delay',
    name: '延时等待',
    description: '延时指定时间后继续执行',
    nodeType: NodeType.DELAY,
    category: '流程控制',
    tags: ['延时', '等待', 'delay', 'wait', 'sleep'],
    defaultData: {
      label: '延时等待',
      duration: 1000,
      unit: 'ms'
    },
    icon: '⏰'
  },
  {
    id: 'template-parallel',
    name: '并行执行',
    description: '并行执行多个任务',
    nodeType: NodeType.PARALLEL,
    category: '流程控制',
    tags: ['并行', '异步', 'parallel', '多任务'],
    defaultData: {
      label: '并行执行',
      maxConcurrency: 3
    },
    icon: '⚡'
  },
  {
    id: 'template-merge',
    name: '数据合并',
    description: '等待并合并多个输入',
    nodeType: NodeType.MERGE,
    category: '流程控制',
    tags: ['合并', '等待', 'merge', 'join', '汇聚'],
    defaultData: {
      label: '数据合并',
      strategy: 'waitAll'
    },
    icon: '🔗'
  },
  {
    id: 'template-output-json',
    name: 'JSON输出',
    description: '以JSON格式输出结果',
    nodeType: NodeType.OUTPUT,
    category: '输入输出',
    tags: ['输出', 'JSON', 'output', '结果'],
    defaultData: {
      label: 'JSON输出',
      outputType: 'json'
    },
    icon: '📄'
  }
];

// 搜索配置
interface SearchConfig {
  includeNodes: boolean;
  includeTemplates: boolean;
  categories: string[];
  nodeTypes: NodeType[];
  maxResults: number;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  includeNodes: true,
  includeTemplates: true,
  categories: [],
  nodeTypes: [],
  maxResults: 20
};

// 搜索Hook
export const useSearch = (initialConfig: Partial<SearchConfig> = {}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [config, setConfig] = useState<SearchConfig>({ 
    ...DEFAULT_SEARCH_CONFIG, 
    ...initialConfig 
  });

  const nodes = useAppSelector(selectNodes);

  // 节点搜索函数
  const searchNodes = useCallback((searchQuery: string): SearchResult[] => {
    if (!config.includeNodes || !searchQuery.trim()) return [];

    const lowerQuery = searchQuery.toLowerCase();
    
    return nodes
      .filter(node => {
        // 类型过滤
        if (config.nodeTypes.length > 0 && !config.nodeTypes.includes(node.type)) {
          return false;
        }

        // 关键词匹配
        const matchLabel = node.data.label.toLowerCase().includes(lowerQuery);
        const matchDescription = node.data.description?.toLowerCase().includes(lowerQuery);
        const matchType = node.type.toLowerCase().includes(lowerQuery);

        return matchLabel || matchDescription || matchType;
      })
      .map(node => ({
        id: node.id,
        type: 'node' as const,
        title: node.data.label,
        description: node.data.description || `${node.type} 节点`,
        category: getNodeCategory(node.type),
        tags: getNodeTags(node),
        nodeType: node.type
      }));
  }, [nodes, config]);

  // 模板搜索函数
  const searchTemplates = useCallback((searchQuery: string): SearchResult[] => {
    if (!config.includeTemplates || !searchQuery.trim()) return [];

    const lowerQuery = searchQuery.toLowerCase();
    
    return NODE_TEMPLATES
      .filter(template => {
        // 分类过滤
        if (config.categories.length > 0 && !config.categories.includes(template.category)) {
          return false;
        }

        // 类型过滤
        if (config.nodeTypes.length > 0 && !config.nodeTypes.includes(template.nodeType)) {
          return false;
        }

        // 关键词匹配
        const matchName = template.name.toLowerCase().includes(lowerQuery);
        const matchDescription = template.description.toLowerCase().includes(lowerQuery);
        const matchTags = template.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

        return matchName || matchDescription || matchTags;
      })
      .map(template => ({
        id: template.id,
        type: 'template' as const,
        title: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        nodeType: template.nodeType
      }));
  }, [config]);

  // 防抖的搜索函数
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      setIsSearching(true);
      
      const nodeResults = searchNodes(searchQuery);
      const templateResults = searchTemplates(searchQuery);
      
      // 合并结果并按相关性排序
      const allResults = [...templateResults, ...nodeResults];
      const sortedResults = sortResultsByRelevance(allResults, searchQuery);
      
      setResults(sortedResults.slice(0, config.maxResults));
      setIsSearching(false);
    }, 300),
    [searchNodes, searchTemplates, config.maxResults]
  );

  // 执行搜索
  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    debouncedSearch(searchQuery);
  }, [debouncedSearch]);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  // 添加搜索历史
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10); // 保留最近10条
    });
  }, []);

  // 获取搜索建议
  const getSuggestions = useCallback((partial: string): string[] => {
    if (!partial.trim()) return [];

    const lowerPartial = partial.toLowerCase();
    const suggestions = new Set<string>();

    // 从模板获取建议
    NODE_TEMPLATES.forEach(template => {
      template.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerPartial)) {
          suggestions.add(tag);
        }
      });
      
      if (template.name.toLowerCase().includes(lowerPartial)) {
        suggestions.add(template.name);
      }
    });

    // 从搜索历史获取建议
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(lowerPartial)) {
        suggestions.add(historyItem);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchHistory]);

  // 更新搜索配置
  const updateConfig = useCallback((newConfig: Partial<SearchConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // 获取所有分类
  const getAllCategories = useCallback((): string[] => {
    const categories = new Set<string>();
    NODE_TEMPLATES.forEach(template => {
      categories.add(template.category);
    });
    return Array.from(categories);
  }, []);

  // 获取热门搜索词
  const getPopularSearches = useCallback((): string[] => {
    return ['智能体', 'LLM', '条件判断', '数据转换', '输入输出', '并行执行'];
  }, []);

  // 清理防抖函数
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    query,
    results,
    isSearching,
    searchHistory,
    config,
    search,
    clearSearch,
    addToHistory,
    getSuggestions,
    updateConfig,
    getAllCategories,
    getPopularSearches,
    templates: NODE_TEMPLATES
  };
};

// 辅助函数：获取节点分类
function getNodeCategory(nodeType: NodeType): string {
  const categoryMap = {
    [NodeType.INPUT]: '输入输出',
    [NodeType.OUTPUT]: '输入输出',
    [NodeType.AGENT]: '智能体',
    [NodeType.CONDITION]: '逻辑控制',
    [NodeType.TRANSFORM]: '数据处理',
    [NodeType.DELAY]: '流程控制',
    [NodeType.PARALLEL]: '流程控制',
    [NodeType.MERGE]: '流程控制'
  };
  return categoryMap[nodeType] || '其他';
}

// 辅助函数：获取节点标签
function getNodeTags(node: WorkflowNode): string[] {
  const baseTags: string[] = [node.type];
  
  // 根据节点类型添加特定标签
  switch (node.type) {
    case NodeType.INPUT:
      baseTags.push('输入', 'input');
      break;
    case NodeType.OUTPUT:
      baseTags.push('输出', 'output');
      break;
    case NodeType.AGENT:
      baseTags.push('智能体', 'AI', 'agent');
      break;
    case NodeType.CONDITION:
      baseTags.push('条件', '判断', 'condition', 'if');
      break;
    case NodeType.TRANSFORM:
      baseTags.push('转换', '处理', 'transform');
      break;
    case NodeType.DELAY:
      baseTags.push('延时', '等待', 'delay');
      break;
    case NodeType.PARALLEL:
      baseTags.push('并行', 'parallel');
      break;
    case NodeType.MERGE:
      baseTags.push('合并', 'merge');
      break;
  }

  return baseTags;
}

// 辅助函数：按相关性排序搜索结果
function sortResultsByRelevance(results: SearchResult[], query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  return results.sort((a, b) => {
    // 计算相关性分数
    const scoreA = calculateRelevanceScore(a, lowerQuery);
    const scoreB = calculateRelevanceScore(b, lowerQuery);
    
    return scoreB - scoreA; // 降序排列
  });
}

// 辅助函数：计算相关性分数
function calculateRelevanceScore(result: SearchResult, query: string): number {
  let score = 0;
  
  // 标题完全匹配
  if (result.title.toLowerCase() === query) {
    score += 100;
  }
  // 标题开头匹配
  else if (result.title.toLowerCase().startsWith(query)) {
    score += 50;
  }
  // 标题包含
  else if (result.title.toLowerCase().includes(query)) {
    score += 25;
  }
  
  // 描述匹配
  if (result.description.toLowerCase().includes(query)) {
    score += 10;
  }
  
  // 标签匹配
  const matchingTags = result.tags.filter(tag => 
    tag.toLowerCase().includes(query)
  ).length;
  score += matchingTags * 5;
  
  // 模板类型优先级更高
  if (result.type === 'template') {
    score += 20;
  }
  
  return score;
}
