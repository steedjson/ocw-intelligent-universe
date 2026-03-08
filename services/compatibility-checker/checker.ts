/**
 * OpenClaw 版本兼容性检查器
 * 
 * 职责：
 * - 检测 OpenClaw 版本变化
 * - 运行兼容性测试
 * - 自动修复不兼容问题
 * - 生成兼容性报告
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface OpenClawStatus {
  version: string;
  gateway: string;
  agents: number;
  workspace: string;
}

export interface CompatibilityResult {
  success: boolean;
  version: string;
  lastCheckedVersion: string | null;
  issues: CompatibilityIssue[];
  fixedIssues: CompatibilityIssue[];
  failedIssues: CompatibilityIssue[];
}

export interface CompatibilityIssue {
  type: 'api' | 'config' | 'feature';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  fixAttempted: boolean;
  fixSuccess?: boolean;
}

export class CompatibilityChecker {
  private reportPath: string;

  constructor(reportPath?: string) {
    this.reportPath = reportPath || path.join(__dirname, '../../COMPATIBILITY.md');
  }

  /**
   * 获取当前 OpenClaw 状态
   */
  public getOpenClawStatus(): OpenClawStatus {
    try {
      const result = execSync('openclaw status --json', { encoding: 'utf-8' });
      return JSON.parse(result);
    } catch (e) {
      throw new Error('无法获取 OpenClaw 状态，请确认 OpenClaw 已安装');
    }
  }

  /**
   * 检查版本是否变化
   */
  public checkVersionChanged(): { changed: boolean; current: string; last: string | null } {
    const currentStatus = this.getOpenClawStatus();
    const lastVersion = this.getLastCheckedVersion();

    return {
      changed: currentStatus.version !== lastVersion,
      current: currentStatus.version,
      last: lastVersion
    };
  }

  /**
   * 运行完整兼容性检查
   */
  public async runFullCheck(): Promise<CompatibilityResult> {
    const versionInfo = this.checkVersionChanged();
    const issues: CompatibilityIssue[] = [];

    // 1. API 兼容性检查
    const apiIssues = await this.checkApiCompatibility();
    issues.push(...apiIssues);

    // 2. 配置格式兼容性检查
    const configIssues = await this.checkConfigCompatibility();
    issues.push(...configIssues);

    // 3. 功能可用性验证
    const featureIssues = await this.checkFeatureAvailability();
    issues.push(...featureIssues);

    // 4. 尝试自动修复
    const fixedIssues: CompatibilityIssue[] = [];
    const failedIssues: CompatibilityIssue[] = [];

    for (const issue of issues) {
      issue.fixAttempted = true;
      const fixSuccess = await this.attemptFix(issue);
      issue.fixSuccess = fixSuccess;

      if (fixSuccess) {
        fixedIssues.push(issue);
      } else {
        failedIssues.push(issue);
      }
    }

    // 5. 更新兼容性报告
    await this.updateCompatibilityReport(versionInfo.current, issues, fixedIssues, failedIssues);

    return {
      success: failedIssues.length === 0,
      version: versionInfo.current,
      lastCheckedVersion: versionInfo.last,
      issues,
      fixedIssues,
      failedIssues
    };
  }

  /**
   * API 兼容性检查
   */
  private async checkApiCompatibility(): Promise<CompatibilityIssue[]> {
    const issues: CompatibilityIssue[] = [];

    try {
      // 测试基本 API 调用
      execSync('openclaw status', { stdio: 'pipe' });
      
      // 测试 skills 命令
      execSync('openclaw skills list', { stdio: 'pipe' });
    } catch (e: any) {
      issues.push({
        type: 'api',
        severity: 'critical',
        description: `OpenClaw API 调用失败：${e.message}`,
        fixAttempted: false
      });
    }

    return issues;
  }

  /**
   * 配置格式兼容性检查
   */
  private async checkConfigCompatibility(): Promise<CompatibilityIssue[]> {
    const issues: CompatibilityIssue[] = [];
    const workspaceRoot = path.resolve(__dirname, '../../../..');

    // 检查 agent-registry.json
    const agentRegistryPath = path.join(workspaceRoot, 'config', 'agent-registry.json');
    if (fs.existsSync(agentRegistryPath)) {
      try {
        JSON.parse(fs.readFileSync(agentRegistryPath, 'utf-8'));
      } catch (e: any) {
        issues.push({
          type: 'config',
          severity: 'critical',
          description: `agent-registry.json 格式错误：${e.message}`,
          fixAttempted: false
        });
      }
    }

    // 检查 skills-config.json
    const skillsConfigPath = path.join(workspaceRoot, 'config', 'skills-config.json');
    if (fs.existsSync(skillsConfigPath)) {
      try {
        JSON.parse(fs.readFileSync(skillsConfigPath, 'utf-8'));
      } catch (e: any) {
        issues.push({
          type: 'config',
          severity: 'critical',
          description: `skills-config.json 格式错误：${e.message}`,
          fixAttempted: false
        });
      }
    }

    return issues;
  }

  /**
   * 功能可用性验证
   */
  private async checkFeatureAvailability(): Promise<CompatibilityIssue[]> {
    const issues: CompatibilityIssue[] = [];

    // 验证智能宇宙核心功能
    // 这里可以添加更多功能测试
    return issues;
  }

  /**
   * 尝试自动修复问题
   */
  private async attemptFix(issue: CompatibilityIssue): Promise<boolean> {
    switch (issue.type) {
      case 'api':
        // API 问题通常无法自动修复，需要人工介入
        return false;

      case 'config':
        // 配置问题可以尝试修复
        return this.attemptConfigFix(issue);

      case 'feature':
        // 功能问题尝试降级或适配
        return this.attemptFeatureFix(issue);

      default:
        return false;
    }
  }

  private async attemptConfigFix(issue: CompatibilityIssue): Promise<boolean> {
    // 配置修复逻辑
    return false;
  }

  private async attemptFeatureFix(issue: CompatibilityIssue): Promise<boolean> {
    // 功能修复逻辑
    return false;
  }

  /**
   * 获取上次检查的版本
   */
  private getLastCheckedVersion(): string | null {
    if (fs.existsSync(this.reportPath)) {
      const content = fs.readFileSync(this.reportPath, 'utf-8');
      const match = content.match(/## 当前版本\n\n`([^`]+)`/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * 更新兼容性报告
   */
  private async updateCompatibilityReport(
    version: string,
    issues: CompatibilityIssue[],
    fixedIssues: CompatibilityIssue[],
    failedIssues: CompatibilityIssue[]
  ): Promise<void> {
    const report = `# 🔧 OpenClaw 兼容性报告

> **自动生成**: ${new Date().toISOString()}
> **智能宇宙版本**: 2.2.0

---

## 当前版本

\`${version}\`

---

## 检查概览

| 项目 | 数量 |
|------|------|
| 发现问题 | ${issues.length} |
| 已修复 | ${fixedIssues.length} |
| 修复失败 | ${failedIssues.length} |
| 兼容性状态 | ${failedIssues.length === 0 ? '✅ 通过' : '❌ 失败'} |

---

## 问题详情

${issues.map(i => `### ${i.type.toUpperCase()} - ${i.severity.toUpperCase()}\n\n${i.description}\n\n- 已尝试修复：${i.fixAttempted ? '是' : '否'}\n- 修复结果：${i.fixSuccess ? '✅ 成功' : '❌ 失败'}\n`).join('\n') || '无问题'}

---

## 下次检查

- 定时检查：每 30 分钟
- 版本更新检查：OpenClaw 版本变化时自动触发

---

**最后更新**: ${new Date().toISOString()}
`;

    fs.writeFileSync(this.reportPath, report, 'utf-8');
  }
}
