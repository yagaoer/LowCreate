import { ComponentData, HistoryState } from './componentTypes';

/**
 * 历史记录优化工具
 * 核心技术点：
 * 1. 避免重复数据的大量冗余
 * 2. 处理回滚途中的重新编辑情况
 * 3. 最大条目数优化
 */

// 定义差异记录类型
interface DiffRecord {
  type: 'add' | 'update' | 'delete' | 'move';
  componentId?: string;
  oldData?: ComponentData;
  newData?: ComponentData;
  position?: number;
  timestamp: number;
}

// 优化的历史状态
interface OptimizedHistoryState {
  snapshots: ComponentData[][]; // 关键快照点
  diffs: DiffRecord[][]; // 差异记录
  currentSnapshotIndex: number;
  currentDiffIndex: number;
  maxSnapshots: number;
  maxDiffsPerSnapshot: number;
}

export class HistoryOptimizer {
  private state: OptimizedHistoryState;

  constructor() {
    this.state = {
      snapshots: [[]],
      diffs: [[]],
      currentSnapshotIndex: 0,
      currentDiffIndex: -1,
      maxSnapshots: 10,
      maxDiffsPerSnapshot: 20,
    };
  }

  /**
   * 添加操作到历史记录
   * 关键优化：只记录差异，而不是完整状态
   */
  pushOperation(
    type: DiffRecord['type'],
    componentId: string,
    oldData?: ComponentData,
    newData?: ComponentData,
    position?: number
  ): void {
    const diff: DiffRecord = {
      type,
      componentId,
      oldData: oldData ? this.deepClone(oldData) : undefined,
      newData: newData ? this.deepClone(newData) : undefined,
      position,
      timestamp: Date.now(),
    };

    // 如果在回滚过程中进行新编辑，需要清除后续的差异记录
    this.clearFutureDiffs();

    // 将差异添加到当前快照组
    const currentDiffs = this.state.diffs[this.state.currentSnapshotIndex];
    currentDiffs.push(diff);
    this.state.currentDiffIndex = currentDiffs.length - 1;

    // 检查是否需要创建新快照
    if (currentDiffs.length >= this.state.maxDiffsPerSnapshot) {
      this.createSnapshot();
    }

    // 清理过期的快照
    this.cleanupOldSnapshots();
  }

  /**
   * 撤销操作
   * 优化点：基于差异记录进行精确回滚
   */
  undo(currentComponents: ComponentData[]): ComponentData[] | null {
    if (this.state.currentDiffIndex >= 0) {
      // 在当前快照组内撤销
      const currentDiffs = this.state.diffs[this.state.currentSnapshotIndex];
      const diff = currentDiffs[this.state.currentDiffIndex];
      
      this.state.currentDiffIndex--;
      return this.applyReverseDiff(currentComponents, diff);
    } else if (this.state.currentSnapshotIndex > 0) {
      // 回退到上一个快照
      this.state.currentSnapshotIndex--;
      const snapshot = this.state.snapshots[this.state.currentSnapshotIndex];
      const diffs = this.state.diffs[this.state.currentSnapshotIndex];
      this.state.currentDiffIndex = diffs.length - 1;
      
      return this.deepClone(snapshot);
    }
    
    return null;
  }

  /**
   * 重做操作
   */
  redo(currentComponents: ComponentData[]): ComponentData[] | null {
    const currentDiffs = this.state.diffs[this.state.currentSnapshotIndex];
    
    if (this.state.currentDiffIndex < currentDiffs.length - 1) {
      // 在当前快照组内重做
      this.state.currentDiffIndex++;
      const diff = currentDiffs[this.state.currentDiffIndex];
      return this.applyDiff(currentComponents, diff);
    } else if (this.state.currentSnapshotIndex < this.state.snapshots.length - 1) {
      // 前进到下一个快照
      this.state.currentSnapshotIndex++;
      const snapshot = this.state.snapshots[this.state.currentSnapshotIndex];
      this.state.currentDiffIndex = -1;
      
      return this.deepClone(snapshot);
    }
    
    return null;
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.state.currentDiffIndex >= 0 || this.state.currentSnapshotIndex > 0;
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    const currentDiffs = this.state.diffs[this.state.currentSnapshotIndex];
    return this.state.currentDiffIndex < currentDiffs.length - 1 || 
           this.state.currentSnapshotIndex < this.state.snapshots.length - 1;
  }

  /**
   * 创建快照点
   * 关键优化：只在必要时创建完整快照
   */
  private createSnapshot(): void {
    // 基于当前快照和差异重建完整状态
    const currentSnapshot = this.state.snapshots[this.state.currentSnapshotIndex];
    const currentDiffs = this.state.diffs[this.state.currentSnapshotIndex];
    
    let newSnapshot = this.deepClone(currentSnapshot);
    
    // 应用所有差异到快照
    for (const diff of currentDiffs) {
      newSnapshot = this.applyDiff(newSnapshot, diff);
    }

    // 添加新快照
    this.state.snapshots.push(newSnapshot);
    this.state.diffs.push([]);
    this.state.currentSnapshotIndex++;
    this.state.currentDiffIndex = -1;
  }

  /**
   * 清除未来的差异记录（用于处理回滚后重新编辑的情况）
   */
  private clearFutureDiffs(): void {
    const currentDiffs = this.state.diffs[this.state.currentSnapshotIndex];
    
    // 清除当前快照组中的未来差异
    if (this.state.currentDiffIndex < currentDiffs.length - 1) {
      this.state.diffs[this.state.currentSnapshotIndex] = 
        currentDiffs.slice(0, this.state.currentDiffIndex + 1);
    }

    // 清除后续的快照和差异组
    if (this.state.currentSnapshotIndex < this.state.snapshots.length - 1) {
      this.state.snapshots = this.state.snapshots.slice(0, this.state.currentSnapshotIndex + 1);
      this.state.diffs = this.state.diffs.slice(0, this.state.currentSnapshotIndex + 1);
    }
  }

  /**
   * 应用差异记录
   */
  private applyDiff(components: ComponentData[], diff: DiffRecord): ComponentData[] {
    switch (diff.type) {
      case 'add':
        return diff.newData ? [...components, diff.newData] : components;
      
      case 'update':
        return components.map(comp => 
          comp.id === diff.componentId && diff.newData 
            ? { ...comp, ...diff.newData }
            : comp
        );
      
      case 'delete':
        return components.filter(comp => comp.id !== diff.componentId);
      
      case 'move':
        // 移动逻辑实现
        const newComponents = [...components];
        const componentIndex = newComponents.findIndex(comp => comp.id === diff.componentId);
        if (componentIndex !== -1 && diff.position !== undefined) {
          const [component] = newComponents.splice(componentIndex, 1);
          newComponents.splice(diff.position, 0, component);
        }
        return newComponents;
      
      default:
        return components;
    }
  }

  /**
   * 应用反向差异记录（用于撤销）
   */
  private applyReverseDiff(components: ComponentData[], diff: DiffRecord): ComponentData[] {
    switch (diff.type) {
      case 'add':
        return components.filter(comp => comp.id !== diff.componentId);
      
      case 'update':
        return components.map(comp => 
          comp.id === diff.componentId && diff.oldData 
            ? { ...comp, ...diff.oldData }
            : comp
        );
      
      case 'delete':
        return diff.oldData ? [...components, diff.oldData] : components;
      
      default:
        return components;
    }
  }

  /**
   * 清理过期快照
   */
  private cleanupOldSnapshots(): void {
    if (this.state.snapshots.length > this.state.maxSnapshots) {
      const removeCount = this.state.snapshots.length - this.state.maxSnapshots;
      this.state.snapshots.splice(0, removeCount);
      this.state.diffs.splice(0, removeCount);
      this.state.currentSnapshotIndex -= removeCount;
    }
  }

  /**
   * 深拷贝工具
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 获取内存使用统计
   */
  getMemoryStats(): {
    snapshotCount: number;
    totalDiffs: number;
    memoryEstimate: string;
  } {
    const totalDiffs = this.state.diffs.reduce((sum, diffs) => sum + diffs.length, 0);
    const memoryEstimate = `${Math.round((JSON.stringify(this.state).length / 1024))} KB`;
    
    return {
      snapshotCount: this.state.snapshots.length,
      totalDiffs,
      memoryEstimate,
    };
  }
} 