/**
 * 配置变更监控器
 * 
 * 职责：
 * - 监控所有 OpenClaw 配置文件变更
 * - 记录变更历史
 * - 触发学习流程
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ConfigChange {
  file: string;
  type: 'add' | 'modify' | 'delete';
  before?: object;
  after?: object;
  timestamp: string;
  analyzed: boolean;
  learned: boolean;
}

export interface WatcherConfig {
  watchPaths: string[];
  checkIntervalMs: number;
  historyLogPath: string;
}

export class ConfigChangeWatcher {
  private config: WatcherConfig;
  private fileSnapshots: Map<string, string>;
  private changeHistory: ConfigChange[];
  private isWatching: boolean;
  private checkInterval?: NodeJS.Timeout;

  constructor(config?: Partial<WatcherConfig>) {
    const workspaceRoot = this.detectWorkspaceRoot();
    
    this.config = {
      watchPaths: config?.watchPaths || [
        path.join(workspaceRoot, 'config', 'agent-registry.json'),
        path.join(workspaceRoot, 'config', 'skills-config.json'),
        path.join(workspaceRoot, 'memory'),
        path.join(workspaceRoot, 'skills')
      ],
      checkIntervalMs: config?.checkIntervalMs || 30000, // 30 秒
      historyLogPath: config?.historyLogPath || path.join(__dirname, '../../CONFIG_CHANGE_HISTORY.json')
    };

    this.fileSnapshots = new Map();
    this.changeHistory = [];
    this.isWatching = false;

    // 加载历史记录
    this.loadHistory();
  }

  /**
   * 检测工作区根目录
   */
  private detectWorkspaceRoot(): string {
    if (process.env.OPENCLAW_WORKSPACE) {
      return process.env.OPENCLAW_WORKSPACE;
    }
    return path.resolve(__dirname, '../../../..');
  }

  /**
   * 开始监控
   */
  public startWatching(): void {
    if (this.isWatching) {
      return;
    }

    console.log('[配置监控器] 开始监控配置变更...');
    this.isWatching = true;

    // 初始化快照
    this.captureSnapshots();

    // 定时检查
    this.checkInterval = setInterval(() => {
      this.checkChanges();
    }, this.config.checkIntervalMs);
  }

  /**
   * 停止监控
   */
  public stopWatching(): void {
    if (!this.isWatching) {
      return;
    }

    console.log('[配置监控器] 停止监控');
    this.isWatching = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  /**
   * 捕获文件快照
   */
  private captureSnapshots(): void {
    for (const watchPath of this.config.watchPaths) {
      if (fs.existsSync(watchPath)) {
        const stats = fs.statSync(watchPath);
        
        if (stats.isFile()) {
          const content = fs.readFileSync(watchPath, 'utf-8');
          this.fileSnapshots.set(watchPath, content);
        } else if (stats.isDirectory()) {
          // 目录则记录所有文件
          this.captureDirectorySnapshot(watchPath);
        }
      }
    }
  }

  /**
   * 捕获目录快照
   */
  private captureDirectorySnapshot(dirPath: string): void {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && (file.endsWith('.json') || file.endsWith('.md'))) {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.fileSnapshots.set(filePath, content);
      } else if (stats.isDirectory()) {
        this.captureDirectorySnapshot(filePath);
      }
    }
  }

  /**
   * 检查变更
   */
  private checkChanges(): void {
    const changes: ConfigChange[] = [];

    for (const [filePath, oldContent] of this.fileSnapshots.entries()) {
      if (!fs.existsSync(filePath)) {
        // 文件被删除
        changes.push({
          file: filePath,
          type: 'delete',
          before: JSON.parse(oldContent),
          after: undefined,
          timestamp: new Date().toISOString(),
          analyzed: false,
          learned: false
        });
      } else {
        const newContent = fs.readFileSync(filePath, 'utf-8');
        if (newContent !== oldContent) {
          // 文件被修改
          changes.push({
            file: filePath,
            type: 'modify',
            before: JSON.parse(oldContent),
            after: JSON.parse(newContent),
            timestamp: new Date().toISOString(),
            analyzed: false,
            learned: false
          });
        }
      }
    }

    // 检查新文件
    for (const watchPath of this.config.watchPaths) {
      if (fs.existsSync(watchPath)) {
        const stats = fs.statSync(watchPath);
        if (stats.isFile() && !this.fileSnapshots.has(watchPath)) {
          const content = fs.readFileSync(watchPath, 'utf-8');
          changes.push({
            file: watchPath,
            type: 'add',
            before: undefined,
            after: JSON.parse(content),
            timestamp: new Date().toISOString(),
            analyzed: false,
            learned: false
          });
        } else if (stats.isDirectory()) {
          this.checkNewFilesInDirectory(watchPath, changes);
        }
      }
    }

    // 处理变更
    for (const change of changes) {
      this.handleChange(change);
    }

    // 更新快照
    if (changes.length > 0) {
      this.captureSnapshots();
    }
  }

  /**
   * 检查目录中的新文件
   */
  private checkNewFilesInDirectory(dirPath: string, changes: ConfigChange[]): void {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && (file.endsWith('.json') || file.endsWith('.md'))) {
        if (!this.fileSnapshots.has(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          changes.push({
            file: filePath,
            type: 'add',
            before: undefined,
            after: JSON.parse(content),
            timestamp: new Date().toISOString(),
            analyzed: false,
            learned: false
          });
        }
      } else if (stats.isDirectory()) {
        this.checkNewFilesInDirectory(filePath, changes);
      }
    }
  }

  /**
   * 处理变更
   */
  private handleChange(change: ConfigChange): void {
    console.log(`[配置监控器] 检测到配置变更：${change.file} (${change.type})`);
    
    // 添加到历史记录
    this.changeHistory.push(change);
    this.saveHistory();

    // 触发学习流程
    this.triggerLearning(change);
  }

  /**
   * 触发学习流程
   */
  private triggerLearning(change: ConfigChange): void {
    // 这里调用 ActiveLearner 进行学习
    console.log(`[配置监控器] 触发学习流程：${change.file}`);
    // 实际实现会调用 ActiveLearner
  }

  /**
   * 加载历史记录
   */
  private loadHistory(): void {
    if (fs.existsSync(this.config.historyLogPath)) {
      try {
        this.changeHistory = JSON.parse(fs.readFileSync(this.config.historyLogPath, 'utf-8'));
      } catch (e) {
        this.changeHistory = [];
      }
    }
  }

  /**
   * 保存历史记录
   */
  private saveHistory(): void {
    // 只保留最近 100 条记录
    const recentHistory = this.changeHistory.slice(-100);
    fs.writeFileSync(this.config.historyLogPath, JSON.stringify(recentHistory, null, 2), 'utf-8');
  }

  /**
   * 获取变更历史
   */
  public getChangeHistory(limit: number = 10): ConfigChange[] {
    return this.changeHistory.slice(-limit);
  }
}
