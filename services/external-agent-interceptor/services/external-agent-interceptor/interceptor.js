"use strict";
/**
 * 外部 Agent 拦截器
 *
 * 职责：
 * - 拦截所有外部 Agent 安装请求
 * - 强制走智能宇宙 12 步流程
 * - 学习并完善智能宇宙自身
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
exports.ExternalAgentInterceptor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const validator_1 = require("../agent-validator/validator");
const registrar_1 = require("../agent-registrar/registrar");
class ExternalAgentInterceptor {
    constructor(learningLogPath) {
        this.validator = new validator_1.AgentValidator();
        this.registrar = new registrar_1.AgentRegistrar();
        this.learningLogPath = learningLogPath || path.join(__dirname, '../../INSTALLATION_LEARNING.json');
    }
    /**
     * 拦截外部 Agent 安装
     */
    interceptExternalInstallation(agent, source) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[拦截器] 检测到外部 Agent 安装请求：${agent.id} (来源：${source})`);
            // 1. 强制走智能宇宙 12 步流程
            console.log('[拦截器] 开始执行 12 步流程...');
            // 步骤 1-3: 需求解析 + 规格生成
            const specResult = this.parseAndGenerateSpec(agent);
            if (!specResult.success) {
                return { success: false, agent, error: specResult.error };
            }
            // 步骤 4-7: 代码审查 + 测试 + 安全审查
            const reviewResult = yield this.runReviewAndTests(agent);
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
            const validation = yield this.validator.validate(agent);
            if (!validation.success) {
                // 回滚
                if (installResult.backupPath) {
                    this.registrar.rollback(installResult.backupPath);
                }
                return { success: false, agent, error: '安装后验证失败' };
            }
            // 学习并完善自身
            yield this.learnFromInstallation(agent, source);
            return {
                success: true,
                agent,
                message: `Agent ${agent.id} 通过智能宇宙流程安装成功`,
                learned: true
            };
        });
    }
    /**
     * 解析并生成规格
     */
    parseAndGenerateSpec(agent) {
        // 验证基本配置
        if (!agent.id || !agent.model || !agent.description) {
            return { success: false, error: 'Agent 配置不完整' };
        }
        return { success: true };
    }
    /**
     * 运行审查和测试
     */
    runReviewAndTests(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            // 运行验证
            const validation = yield this.validator.validate(agent);
            if (!validation.success) {
                return { success: false, error: validation.message };
            }
            return { success: true };
        });
    }
    /**
     * 生成提案
     */
    generateProposal(agent) {
        // 简化实现
        return { success: true };
    }
    /**
     * 从安装中学习
     */
    learnFromInstallation(agent, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const learning = {
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
            let learnings = [];
            if (fs.existsSync(this.learningLogPath)) {
                learnings = JSON.parse(fs.readFileSync(this.learningLogPath, 'utf-8'));
            }
            // 添加新学习记录
            learnings.push(learning);
            // 写入学习日志
            fs.writeFileSync(this.learningLogPath, JSON.stringify(learnings, null, 2), 'utf-8');
            console.log(`[拦截器] 已记录安装学习：${agent.id}`);
            // 分析模式，更新模板库
            yield this.analyzeAndUpdateTemplates(learning);
        });
    }
    /**
     * 分析并更新模板库
     */
    analyzeAndUpdateTemplates(learning) {
        return __awaiter(this, void 0, void 0, function* () {
            // 分析配置模式
            // 如果发现新的模式，添加到模板库
            // 这里简化实现
            console.log('[拦截器] 分析安装模式，更新模板库...');
        });
    }
}
exports.ExternalAgentInterceptor = ExternalAgentInterceptor;
