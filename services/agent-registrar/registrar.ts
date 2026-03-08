/**
 * Agent 注册服务
 * 
 * 职责：
 * - 将 Agent 注册到 OpenClaw
 * - 更新 agent-registry.json
 * - 验证注册结果
 * - 支持回滚操作
 */

import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig } from '../../factories/agent-factory/factory';

export interface RegistrationResult {
  success: boolean;
  agent: AgentConfig;
  message?: string;
  error?: string;
  backupPath?: string;
}

export class AgentRegistrar {
  private agentRegistryPath: string;

  constructor(registryPath?: string) {
    this.agentRegistryPath = registryPath || this.detectRegistryPath();
  }

  /**
   * 检测 agent-registry.json 路径
   */
  private detectRegistryPath(): string {
    // 1. 从环境变量读取
    if (process.env.OPENCLAW_CONFIG_DIR) {
      return path.join(process.env.OPENCLAW_CONFIG_DIR, 'agent-registry.json');
    }

    // 2. 从相对路径推导
    const workspaceRoot = path.resolve(__dirname, '../../../..');
    return path.join(workspaceRoot, 'config', 'agent-registry.json');
  }

  /**
   * 注册 Agent
   */
  public register(agent: AgentConfig): RegistrationResult {
    try {
      // 1. 备份现有配置
      const backupPath = this.createBackup();

      // 2. 读取现有配置
      const registry = JSON.parse(fs.readFileSync(this.agentRegistryPath, 'utf-8'));

      // 3. 添加到 virtual_agents
      if (!registry.virtual_agents) {
        registry.virtual_agents = [];
      }

      // 检查是否已存在
      const existingIndex = registry.virtual_agents.findIndex((a: AgentConfig) => a.id === agent.id);
      if (existingIndex !== -1) {
        // 更新现有 Agent
        registry.virtual_agents[existingIndex] = agent;
      } else {
        // 添加新 Agent
        registry.virtual_agents.push(agent);
      }

      // 4. 更新最后更新时间
      registry.lastUpdated = new Date().toISOString();

      // 5. 写入配置
      fs.writeFileSync(this.agentRegistryPath, JSON.stringify(registry, null, 2), 'utf-8');

      return {
        success: true,
        agent,
        message: `Agent ${agent.id} 注册成功`,
        backupPath
      };
    } catch (e: any) {
      return {
        success: false,
        agent,
        error: `注册失败：${e.message}`,
        backupPath: undefined
      };
    }
  }

  /**
   * 卸载 Agent
   */
  public unregister(agentId: string): RegistrationResult {
    try {
      // 1. 备份现有配置
      const backupPath = this.createBackup();

      // 2. 读取现有配置
      const registry = JSON.parse(fs.readFileSync(this.agentRegistryPath, 'utf-8'));

      // 3. 从 virtual_agents 中移除
      if (registry.virtual_agents) {
        const initialLength = registry.virtual_agents.length;
        registry.virtual_agents = registry.virtual_agents.filter((a: AgentConfig) => a.id !== agentId);

        if (registry.virtual_agents.length === initialLength) {
          return {
            success: false,
            agent: { id: agentId, model: '', tools: [], description: '' },
            error: `Agent ${agentId} 不存在`
          };
        }
      }

      // 4. 更新最后更新时间
      registry.lastUpdated = new Date().toISOString();

      // 5. 写入配置
      fs.writeFileSync(this.agentRegistryPath, JSON.stringify(registry, null, 2), 'utf-8');

      return {
        success: true,
        agent: { id: agentId, model: '', tools: [], description: '' },
        message: `Agent ${agentId} 卸载成功`,
        backupPath
      };
    } catch (e: any) {
      return {
        success: false,
        agent: { id: agentId, model: '', tools: [], description: '' },
        error: `卸载失败：${e.message}`,
        backupPath: undefined
      };
    }
  }

  /**
   * 回滚到备份
   */
  public rollback(backupPath: string): boolean {
    try {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, this.agentRegistryPath);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * 创建备份
   */
  private createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.agentRegistryPath}.bak.${timestamp}`;
    fs.copyFileSync(this.agentRegistryPath, backupPath);
    return backupPath;
  }

  /**
   * 获取注册路径 (用于调试/验证)
   */
  public getRegistryPath(): string {
    return this.agentRegistryPath;
  }
}
