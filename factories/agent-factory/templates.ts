/**
 * Agent 配置模板库
 * 
 * 提供预定义的 Agent 模板，方便快速创建
 */

import { AgentConfig } from './factory';

export interface AgentTemplate {
  id: string;
  description: string;
  category: 'coding' | 'review' | 'planning' | 'analysis' | 'custom';
  config: Omit<AgentConfig, 'id' | 'description'>;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'code-generator',
    description: '代码生成专家，负责根据需求生成高质量代码',
    category: 'coding',
    config: {
      model: 'bailian/qwen3-coder-plus',
      tools: ['profile:coding', 'exec'],
      priority: 2
    }
  },
  {
    id: 'code-reviewer',
    description: '代码审查专家，负责代码质量审查和安全审计',
    category: 'review',
    config: {
      model: 'bailian/qwen3-coder-plus',
      tools: ['profile:coding', '*'],
      priority: 2
    }
  },
  {
    id: 'architect',
    description: '系统架构师，负责系统架构设计和技术选型',
    category: 'planning',
    config: {
      model: 'bailian/qwen3-max-2026-01-23',
      tools: ['*'],
      priority: 2
    }
  },
  {
    id: 'planner',
    description: '任务规划师，负责任务分解和进度规划',
    category: 'planning',
    config: {
      model: 'bailian/qwen3.5-plus',
      tools: ['*'],
      priority: 2
    }
  },
  {
    id: 'security-auditor',
    description: '安全审计专家，负责安全漏洞扫描和修复建议',
    category: 'review',
    config: {
      model: 'bailian/qwen3-coder-plus',
      tools: ['*', 'profile:coding'],
      priority: 1
    }
  },
  {
    id: 'data-analyst',
    description: '数据分析师，负责数据分析和报告生成',
    category: 'analysis',
    config: {
      model: 'bailian/qwen3.5-plus',
      tools: ['*', 'exec'],
      priority: 3
    }
  },
  {
    id: 'doc-writer',
    description: '文档撰写专家，负责技术文档和使用说明编写',
    category: 'custom',
    config: {
      model: 'bailian/qwen3.5-plus',
      tools: ['*'],
      priority: 3
    }
  },
  {
    id: 'test-engineer',
    description: '测试工程师，负责测试用例编写和执行',
    category: 'review',
    config: {
      model: 'bailian/qwen3-coder-plus',
      tools: ['profile:coding', 'exec'],
      priority: 2
    }
  }
];

/**
 * 根据类别获取模板
 */
export function getTemplatesByCategory(category: AgentTemplate['category']): AgentTemplate[] {
  return AGENT_TEMPLATES.filter(t => t.category === category);
}

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): AgentTemplate | undefined {
  return AGENT_TEMPLATES.find(t => t.id === id);
}

/**
 * 获取所有模板类别
 */
export function getCategories(): string[] {
  return [...new Set(AGENT_TEMPLATES.map(t => t.category))];
}
