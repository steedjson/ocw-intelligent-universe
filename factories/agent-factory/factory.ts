/**
 * Agent 孵化工厂
 * 
 * 职责：根据 OpenClaw 官方规则创建 Agent 配置
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AgentConfig {
  id: string;
  model: string;
  tools: string[];
  description: string;
  priority?: number;
}

export class AgentFactory {
  private agentRegistryPath: string;

  constructor(registryPath: string = '/Users/changsailong/.openclaw/workspace/config/agent-registry.json') {
    this.agentRegistryPath = registryPath;
  }

  /**
   * 创建新 Agent
   */
  public async createAgent(config: AgentConfig): Promise<AgentCreationResult> {
    // 1. 验证模型是否在可用列表中
    const availableModels = this.getAvailableModels();
    if (!availableModels.includes(config.model)) {
      return {
        success: false,
        error: `模型 ${config.model} 不在可用列表中`,
        availableModels
      };
    }

    // 2. 检查 Agent ID 是否已存在
    const existingAgents = this.getExistingAgents();
    if (existingAgents.find(a => a.id === config.id)) {
      return {
        success: false,
        error: `Agent ${config.id} 已存在`,
        existingAgents
      };
    }

    // 3. 生成 Agent 配置
    const newAgent: AgentConfig = {
      id: config.id,
      model: config.model,
      tools: config.tools || ['*'],
      description: config.description,
      priority: config.priority || 3
    };

    // 4. 注册到 agent-registry.json
    this.registerAgent(newAgent);

    return {
      success: true,
      agent: newAgent,
      message: `Agent ${config.id} 创建成功`
    };
  }

  private getAvailableModels(): string[] {
    try {
      const registry = JSON.parse(fs.readFileSync(this.agentRegistryPath, 'utf-8'));
      const allModels: string[] = [];
      for (const key in registry.available_models) {
        allModels.push(...registry.available_models[key]);
      }
      return allModels;
    } catch (e) {
      return [];
    }
  }

  private getExistingAgents(): AgentConfig[] {
    try {
      const registry = JSON.parse(fs.readFileSync(this.agentRegistryPath, 'utf-8'));
      return [...registry.builtin_agents || [], ...registry.virtual_agents || []];
    } catch (e) {
      return [];
    }
  }

  private registerAgent(agent: AgentConfig): void {
    const registry = JSON.parse(fs.readFileSync(this.agentRegistryPath, 'utf-8'));
    
    // 添加到 virtual_agents
    if (!registry.virtual_agents) {
      registry.virtual_agents = [];
    }
    registry.virtual_agents.push(agent);
    registry.lastUpdated = new Date().toISOString();

    fs.writeFileSync(this.agentRegistryPath, JSON.stringify(registry, null, 2), 'utf-8');
  }
}

export interface AgentCreationResult {
  success: boolean;
  agent?: AgentConfig;
  error?: string;
  message?: string;
  availableModels?: string[];
  existingAgents?: AgentConfig[];
}
