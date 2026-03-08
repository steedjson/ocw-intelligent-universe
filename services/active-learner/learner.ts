/**
 * 主动学习器
 * 
 * 职责：
 * - 主动学习未知配置
 * - 查询官方文档/权威知识
 * - 更新智能宇宙知识库
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface LearningResult {
  success: boolean;
  topic: string;
  source: 'official' | 'authority' | 'community';
  knowledge: object;
  updatedAt: string;
}

export interface KnowledgeBase {
  configPatterns: Record<string, any>;
  validationRules: Record<string, any>;
  templates: Record<string, any>;
  lastUpdated: string;
}

export class ActiveLearner {
  private knowledgeBasePath: string;
  private knowledgeBase: KnowledgeBase;

  constructor(knowledgeBasePath?: string) {
    this.knowledgeBasePath = knowledgeBasePath || path.join(__dirname, '../../KNOWLEDGE_BASE.json');
    this.knowledgeBase = this.loadKnowledgeBase();
  }

  /**
   * 加载知识库
   */
  private loadKnowledgeBase(): KnowledgeBase {
    if (fs.existsSync(this.knowledgeBasePath)) {
      return JSON.parse(fs.readFileSync(this.knowledgeBasePath, 'utf-8'));
    }

    return {
      configPatterns: {},
      validationRules: {},
      templates: {},
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 保存知识库
   */
  private saveKnowledgeBase(): void {
    this.knowledgeBase.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.knowledgeBasePath, JSON.stringify(this.knowledgeBase, null, 2), 'utf-8');
  }

  /**
   * 主动学习未知配置
   */
  public async learnUnknownConfig(configKey: string, configValue: any): Promise<LearningResult> {
    console.log(`[主动学习器] 开始学习未知配置：${configKey}`);

    // 1. 查询 OpenClaw 官方文档
    const officialDoc = await this.searchOfficialDocs(configKey);
    if (officialDoc) {
      console.log(`[主动学习器] 从官方文档学习到：${configKey}`);
      return this.recordLearning(configKey, officialDoc, 'official');
    }

    // 2. 查询权威知识库
    const authorityKnowledge = await this.searchAuthorityKnowledge(configKey);
    if (authorityKnowledge) {
      console.log(`[主动学习器] 从权威知识学习到：${configKey}`);
      return this.recordLearning(configKey, authorityKnowledge, 'authority');
    }

    // 3. 查询社区最佳实践
    const communityPractice = await this.searchCommunityPractice(configKey);
    if (communityPractice) {
      console.log(`[主动学习器] 从社区实践学习到：${configKey}`);
      return this.recordLearning(configKey, communityPractice, 'community');
    }

    // 学习失败
    return {
      success: false,
      topic: configKey,
      source: 'official',
      knowledge: {},
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 查询官方文档
   */
  private async searchOfficialDocs(topic: string): Promise<object | null> {
    try {
      // 尝试通过 OpenClaw 命令获取帮助
      const result = execSync(`openclaw help ${topic}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      return {
        source: 'official',
        content: result,
        url: `https://docs.openclaw.ai/search?q=${encodeURIComponent(topic)}`
      };
    } catch (e) {
      // 尝试读取本地文档
      const docsPath = path.resolve(__dirname, '../../../../docs');
      if (fs.existsSync(docsPath)) {
        const docFiles = fs.readdirSync(docsPath);
        for (const file of docFiles) {
          if (file.toLowerCase().includes(topic.toLowerCase())) {
            const content = fs.readFileSync(path.join(docsPath, file), 'utf-8');
            return {
              source: 'official',
              content: content,
              file: file
            };
          }
        }
      }
      return null;
    }
  }

  /**
   * 查询权威知识库
   */
  private async searchAuthorityKnowledge(topic: string): Promise<object | null> {
    // 这里可以实现调用外部权威 API
    // 例如 GitHub API、技术文档 API 等
    return null;
  }

  /**
   * 查询社区最佳实践
   */
  private async searchCommunityPractice(topic: string): Promise<object | null> {
    // 这里可以实现查询社区实践
    return null;
  }

  /**
   * 记录学习结果
   */
  private recordLearning(topic: string, knowledge: object, source: 'official' | 'authority' | 'community'): LearningResult {
    const result: LearningResult = {
      success: true,
      topic,
      source,
      knowledge,
      updatedAt: new Date().toISOString()
    };

    // 更新知识库
    this.updateKnowledgeBase(topic, knowledge);

    return result;
  }

  /**
   * 更新知识库
   */
  private updateKnowledgeBase(topic: string, knowledge: object): void {
    // 分析知识类型，更新对应部分
    if (this.isConfigPattern(knowledge)) {
      this.knowledgeBase.configPatterns[topic] = knowledge;
    }

    if (this.isValidationRule(knowledge)) {
      this.knowledgeBase.validationRules[topic] = knowledge;
    }

    if (this.isTemplate(knowledge)) {
      this.knowledgeBase.templates[topic] = knowledge;
    }

    this.saveKnowledgeBase();
    console.log(`[主动学习器] 知识库已更新：${topic}`);
  }

  /**
   * 判断是否是配置模式
   */
  private isConfigPattern(knowledge: object): boolean {
    // 简化判断逻辑
    return true;
  }

  /**
   * 判断是否是验证规则
   */
  private isValidationRule(knowledge: object): boolean {
    // 简化判断逻辑
    return false;
  }

  /**
   * 判断是否是模板
   */
  private isTemplate(knowledge: object): boolean {
    // 简化判断逻辑
    return false;
  }

  /**
   * 获取知识库
   */
  public getKnowledgeBase(): KnowledgeBase {
    return this.knowledgeBase;
  }

  /**
   * 查询知识库
   */
  public queryKnowledge(topic: string): any {
    return this.knowledgeBase.configPatterns[topic] || 
           this.knowledgeBase.validationRules[topic] || 
           this.knowledgeBase.templates[topic];
  }
}
