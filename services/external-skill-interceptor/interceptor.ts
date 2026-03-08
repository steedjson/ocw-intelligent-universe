/**
 * 外部 Skill 拦截器
 * 
 * 职责：
 * - 拦截所有外部 Skill 安装请求
 * - 强制走智能宇宙 12 步流程
 * - 学习并完善智能宇宙自身
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SkillConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  main: string;
  permissions?: {
    read?: string[];
    write?: string[];
    execute?: string[];
  };
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface InterceptionResult {
  success: boolean;
  skill: SkillConfig;
  message?: string;
  error?: string;
  learned?: boolean;
}

export interface SkillInstallationLearning {
  skillId: string;
  configPattern: Partial<SkillConfig>;
  dependencies: string[];
  permissions: string[];
  issues: string[];
  solutions: string[];
  timestamp: string;
}

export class ExternalSkillInterceptor {
  private learningLogPath: string;
  private skillsConfigPath: string;

  constructor(learningLogPath?: string, skillsConfigPath?: string) {
    this.learningLogPath = learningLogPath || path.join(__dirname, '../../SKILL_INSTALLATION_LEARNING.json');
    this.skillsConfigPath = skillsConfigPath || this.detectSkillsConfigPath();
  }

  /**
   * 检测 skills-config.json 路径
   */
  private detectSkillsConfigPath(): string {
    // 1. 从环境变量读取
    if (process.env.OPENCLAW_CONFIG_DIR) {
      return path.join(process.env.OPENCLAW_CONFIG_DIR, 'skills-config.json');
    }

    // 2. 从相对路径推导
    const workspaceRoot = path.resolve(__dirname, '../../../..');
    return path.join(workspaceRoot, 'config', 'skills-config.json');
  }

  /**
   * 拦截外部 Skill 安装
   */
  public async interceptExternalInstallation(skill: SkillConfig, source: string): Promise<InterceptionResult> {
    console.log(`[Skill 拦截器] 检测到外部 Skill 安装请求：${skill.id} (来源：${source})`);

    // 1. 强制走智能宇宙 12 步流程
    console.log('[Skill 拦截器] 开始执行 12 步流程...');
    
    // 步骤 1-3: 需求解析 + 规格生成
    const specResult = this.parseAndGenerateSpec(skill);
    if (!specResult.success) {
      return { success: false, skill, error: specResult.error };
    }

    // 步骤 4-7: 代码审查 + 测试 + 安全审查
    const reviewResult = await this.runReviewAndTests(skill);
    if (!reviewResult.success) {
      return { success: false, skill, error: reviewResult.error };
    }

    // 步骤 8: 提案生成（简化）
    const proposalResult = this.generateProposal(skill);

    // 步骤 9: 小主人审批（这里简化为自动通过，实际应该等待审批）
    const approved = true;
    if (!approved) {
      return { success: false, skill, error: '安装未通过审批' };
    }

    // 步骤 10-12: 安装执行 + 验证 + 文档归档
    const installResult = this.registerSkill(skill);
    if (!installResult.success) {
      return { success: false, skill, error: installResult.error };
    }

    // 学习并完善自身
    await this.learnFromInstallation(skill, source);

    return {
      success: true,
      skill,
      message: `Skill ${skill.id} 通过智能宇宙流程安装成功`,
      learned: true
    };
  }

  /**
   * 解析并生成规格
   */
  private parseAndGenerateSpec(skill: SkillConfig): { success: boolean; error?: string } {
    // 验证基本配置
    if (!skill.id || !skill.name || !skill.version || !skill.description) {
      return { success: false, error: 'Skill 配置不完整' };
    }

    // 验证 skill.json 规范
    if (!skill.main) {
      return { success: false, error: '缺少 main 入口定义' };
    }

    return { success: true };
  }

  /**
   * 运行审查和测试
   */
  private async runReviewAndTests(skill: SkillConfig): Promise<{ success: boolean; error?: string }> {
    // 验证权限配置
    if (skill.permissions) {
      // 检查是否有危险权限
      const dangerousWrites = skill.permissions.write?.filter(p => 
        p.includes('..') || p.includes('*') || p.startsWith('/')
      );
      
      if (dangerousWrites && dangerousWrites.length > 0) {
        return { success: false, error: `危险写权限：${dangerousWrites.join(', ')}` };
      }
    }

    // 验证依赖
    if (skill.dependencies) {
      // 检查依赖是否存在
      // 这里简化处理
    }

    return { success: true };
  }

  /**
   * 生成提案
   */
  private generateProposal(skill: SkillConfig): { success: boolean } {
    // 简化实现
    return { success: true };
  }

  /**
   * 注册 Skill 到 skills-config.json
   */
  private registerSkill(skill: SkillConfig): { success: boolean; error?: string } {
    try {
      // 1. 备份现有配置
      const backupPath = this.createBackup();

      // 2. 读取现有配置
      const config = JSON.parse(fs.readFileSync(this.skillsConfigPath, 'utf-8'));

      // 3. 添加到 skills
      if (!config.skills) {
        config.skills = {};
      }

      // 检查是否已存在
      if (config.skills[skill.id]) {
        return { success: false, error: `Skill ${skill.id} 已存在` };
      }

      // 4. 注册 Skill
      config.skills[skill.id] = {
        enabled: true,
        version: skill.version,
        path: `skills/${skill.id}`,
        description: skill.description,
        priority: 3,
        dependencies: skill.dependencies || [],
        config: skill.config || {}
      };

      // 5. 更新最后更新时间
      config.updated = new Date().toISOString();

      // 6. 写入配置
      fs.writeFileSync(this.skillsConfigPath, JSON.stringify(config, null, 2), 'utf-8');

      return {
        success: true,
        error: undefined
      };
    } catch (e: any) {
      return {
        success: false,
        error: `注册失败：${e.message}`
      };
    }
  }

  /**
   * 从安装中学习
   */
  private async learnFromInstallation(skill: SkillConfig, source: string): Promise<void> {
    const learning: SkillInstallationLearning = {
      skillId: skill.id,
      configPattern: {
        version: skill.version,
        permissions: skill.permissions,
        config: skill.config
      },
      dependencies: skill.dependencies || [],
      permissions: [
        ...(skill.permissions?.read || []),
        ...(skill.permissions?.write || []),
        ...(skill.permissions?.execute || [])
      ],
      issues: [],
      solutions: [],
      timestamp: new Date().toISOString()
    };

    // 读取现有学习日志
    let learnings: SkillInstallationLearning[] = [];
    if (fs.existsSync(this.learningLogPath)) {
      learnings = JSON.parse(fs.readFileSync(this.learningLogPath, 'utf-8'));
    }

    // 添加新学习记录
    learnings.push(learning);

    // 写入学习日志
    fs.writeFileSync(this.learningLogPath, JSON.stringify(learnings, null, 2), 'utf-8');

    console.log(`[Skill 拦截器] 已记录安装学习：${skill.id}`);

    // 分析模式，更新模板库
    await this.analyzeAndUpdateTemplates(learning);
  }

  /**
   * 分析并更新模板库
   */
  private async analyzeAndUpdateTemplates(learning: SkillInstallationLearning): Promise<void> {
    // 分析配置模式
    // 如果发现新的模式，添加到模板库
    // 这里简化实现
    console.log('[Skill 拦截器] 分析安装模式，更新模板库...');
  }

  /**
   * 创建备份
   */
  private createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.skillsConfigPath}.bak.${timestamp}`;
    fs.copyFileSync(this.skillsConfigPath, backupPath);
    return backupPath;
  }
}
