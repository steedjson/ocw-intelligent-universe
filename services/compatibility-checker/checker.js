"use strict";
/**
 * OpenClaw 版本兼容性检查器
 *
 * 职责：
 * - 检测 OpenClaw 版本变化
 * - 运行兼容性测试
 * - 自动修复不兼容问题
 * - 生成兼容性报告
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibilityChecker = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class CompatibilityChecker {
    constructor(reportPath) {
        this.reportPath = reportPath || path.join(__dirname, '../../COMPATIBILITY.md');
    }
    /**
     * 获取当前 OpenClaw 状态
     */
    getOpenClawStatus() {
        try {
            const result = (0, child_process_1.execSync)('openclaw status --json', { encoding: 'utf-8' });
            return JSON.parse(result);
        }
        catch (e) {
            throw new Error('无法获取 OpenClaw 状态，请确认 OpenClaw 已安装');
        }
    }
    /**
     * 检查版本是否变化
     */
    checkVersionChanged() {
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
    runFullCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionInfo = this.checkVersionChanged();
            const issues = [];
            // 1. API 兼容性检查
            const apiIssues = yield this.checkApiCompatibility();
            issues.push(...apiIssues);
            // 2. 配置格式兼容性检查
            const configIssues = yield this.checkConfigCompatibility();
            issues.push(...configIssues);
            // 3. 功能可用性验证
            const featureIssues = yield this.checkFeatureAvailability();
            issues.push(...featureIssues);
            // 4. 尝试自动修复
            const fixedIssues = [];
            const failedIssues = [];
            for (const issue of issues) {
                issue.fixAttempted = true;
                const fixSuccess = yield this.attemptFix(issue);
                issue.fixSuccess = fixSuccess;
                if (fixSuccess) {
                    fixedIssues.push(issue);
                }
                else {
                    failedIssues.push(issue);
                }
            }
            // 5. 更新兼容性报告
            yield this.updateCompatibilityReport(versionInfo.current, issues, fixedIssues, failedIssues);
            return {
                success: failedIssues.length === 0,
                version: versionInfo.current,
                lastCheckedVersion: versionInfo.last,
                issues,
                fixedIssues,
                failedIssues
            };
        });
    }
    /**
     * API 兼容性检查
     */
    checkApiCompatibility() {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = [];
            try {
                // 测试基本 API 调用
                (0, child_process_1.execSync)('openclaw status', { stdio: 'pipe' });
                // 测试 skills 命令
                (0, child_process_1.execSync)('openclaw skills list', { stdio: 'pipe' });
            }
            catch (e) {
                issues.push({
                    type: 'api',
                    severity: 'critical',
                    description: `OpenClaw API 调用失败：${e.message}`,
                    fixAttempted: false
                });
            }
            return issues;
        });
    }
    /**
     * 配置格式兼容性检查
     */
    checkConfigCompatibility() {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = [];
            const workspaceRoot = path.resolve(__dirname, '../../../..');
            // 检查 agent-registry.json
            const agentRegistryPath = path.join(workspaceRoot, 'config', 'agent-registry.json');
            if (fs.existsSync(agentRegistryPath)) {
                try {
                    JSON.parse(fs.readFileSync(agentRegistryPath, 'utf-8'));
                }
                catch (e) {
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
                }
                catch (e) {
                    issues.push({
                        type: 'config',
                        severity: 'critical',
                        description: `skills-config.json 格式错误：${e.message}`,
                        fixAttempted: false
                    });
                }
            }
            return issues;
        });
    }
    /**
     * 功能可用性验证
     */
    checkFeatureAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = [];
            // 验证智能宇宙核心功能
            // 这里可以添加更多功能测试
            return issues;
        });
    }
    /**
     * 尝试自动修复问题
     */
    attemptFix(issue) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    attemptConfigFix(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            // 配置修复逻辑
            return false;
        });
    }
    attemptFeatureFix(issue) {
        return __awaiter(this, void 0, void 0, function* () {
            // 功能修复逻辑
            return false;
        });
    }
    /**
     * 获取上次检查的版本
     */
    getLastCheckedVersion() {
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
    updateCompatibilityReport(version, issues, fixedIssues, failedIssues) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.CompatibilityChecker = CompatibilityChecker;
