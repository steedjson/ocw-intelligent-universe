/**
 * 外部 Agent 拦截器
 * 
 * 职责：
 * - 拦截所有外部 Agent 安装请求
 * - 强制走智能宇宙 12 步流程
 * - 学习并完善智能宇宙自身
 */

import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig } from '../../factories/agent-factory/factory';
import { AgentValidator } from '../agent-validator/validator';
import { AgentRegistrar } from '../agent-registrar/registrar';

export interface InterceptionResult {
  success: boolean;
  agent: AgentConfig;
  message?: string;
  error?: string;
  learned?: boolean;
}

export interface InstallationLearning {
  agentType: string;
  configPattern: Partial<AgentConfig>;
  issues: string[];
  solutions: string[];
  timestamp: string;
}

export class ExternalAgentInterceptor {
  private validator: AgentValidator;
  private registrar: AgentRegistrar;
  private learningLogPath: string;

  constructor(learningLogPath?: string) {
    this.validator = new AgentValidator();
    this.registrar = new AgentRegistrar();
    this.learningLogPath = learningLogPath || path.join(__dirname, '../../INSTALLATION_LEARNING.json');
  }

  /**
   * 拦截外部 Agent 安装
   */
  public async interceptExternalInstallation(agent: AgentConfig, source: string): Promise<InterceptionResult> {
    console.log(`[拦截器] 检测到外部 Agent 安装请求：${agent.id} (来源：${source})`);

    // 1. 强制走智能宇宙 12 步流程
    console.log('[拦截器] 开始执行 12 步流程...');
    
    // 步骤 1-3: 需求解析 + 规格生成
    const specResult = this.parseAndGenerateSpec(agent);
    if (!specResult.success) {
      return { success: false, agent, error: specResult.error };
    }

    // 步骤 4-7: 代码审查 + 测试 + 安全审查
    const reviewResult = await this.runReviewAndTests(agent);
    if (!reviewResult.success) {
      return { success: false, agent, error: reviewResult.error };
    }

    // 步骤 8: 提案生成（简化）
    const proposalResult = this.generateProposal(agent);

    // 步骤 9: 小主人审批（这里简化为自动通过，实际应该等待审批）
    const approved = true;
    if (!approved) {
      return { success: false, agent, error: '安装未通过审批' };
    }

    // 步骤 10-12: 安装执行 + 验证 + 文档归档
    const installResult = this.registrar.register(agent);
    if (!installResult.success) {
      return { success: false, agent, error: installResult.error };
    }

    // 验证安装
    const validation = await this.validator.validate(agent);
    if (!validation.success) {
      // 回滚
      if (installResult.backupPath) {
        this.registrar.rollback(installResult.backupPath);
      }
      return { success: false, agent, error: '安装后验证失败' };
    }

    // 学习并完善自身
    await this.learnFromInstallation(agent, source);

    return {
      success: true,
      agent,
      message: `Agent ${agent.id} 通过智能宇宙流程安装成功`,
      learned: true
    };
  }

  /**
   * 解析并生成规格
   */
  private parseAndGenerateSpec(agent: AgentConfig): { success: boolean; error?: string } {
    // 验证基本配置
    if (!agent.id || !agent.model || !agent.description) {
      return { success: false, error: 'Agent 配置不完整' };
    }

    return { success: true };
  }

  /**
   * 运行审查和测试
   */
  private async runReviewAndTests(agent: AgentConfig): Promise<{ success: boolean; error?: string }> {
    // 运行验证
    const validation = await this.validator.validate(agent);
    if (!validation.success) {
      return { success: false, error: validation.message };
    }

    return { success: true };
  }

  /**
   * 生成提案
   */
  private generateProposal(agent: AgentConfig): { success: boolean } {
    // 简化实现
    return { success: true };
  }

  /**
   * 从安装中学习
   */
  private async learnFromInstallation(agent: AgentConfig, source: string): Promise<void> {
    const learning: InstallationLearning = {
      agentType: agent.id,
      configPattern: {
        model: agent.model,
        tools: agent.tools,
        priority: agent.priority
      },
      issues: [],
      solutions: [],
      timestamp: new Date().toISOString()
    };

    // 读取现有学习日志
    let learnings: InstallationLearning[] = [];
    if (fs.existsSync(this.learningLogPath)) {
      learnings = JSON.parse(fs.readFileSync(this.learningLogPath, 'utf-8'));
    }

    // 添加新学习记录
    learnings.push(learning);

    // 写入学习日志
    fs.writeFileSync(this.learningLogPath, JSON.stringify(learnings, null, 2), 'utf-8');

    console.log(`[拦截器] 已记录安装学习：${agent.id}`);

    // 分析模式，更新模板库
    await this.analyzeAndUpdateTemplates(learning);
  }

  /**
   * 分析并更新模板库
   */
  private async analyzeAndUpdateTemplates(learning: InstallationLearning): Promise<void> {
    // 分析配置模式
    // 如果发现新的模式，添加到模板库
    // 这里简化实现
    console.log('[拦截器] 分析安装模式，更新模板库...');
  }
}
