"use strict";
/**
 * Agent 孵化工厂
 *
 * 职责：根据 OpenClaw 官方规则创建 Agent 配置
 *
 * ⚠️ 路径规则：
 * - 默认使用相对路径
 * - 需要绝对路径时调用 OpenClaw 大脑获取
 * - 禁止硬编码绝对路径
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
exports.AgentFactory = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AgentFactory {
    constructor(pathConfig) {
        // 使用相对路径或从配置读取
        const workspaceRoot = (pathConfig === null || pathConfig === void 0 ? void 0 : pathConfig.workspaceRoot) || this.detectWorkspaceRoot();
        this.pathConfig = {
            workspaceRoot,
            configDir: (pathConfig === null || pathConfig === void 0 ? void 0 : pathConfig.configDir) || path.join(workspaceRoot, 'config'),
            agentRegistry: (pathConfig === null || pathConfig === void 0 ? void 0 : pathConfig.agentRegistry) || path.join(workspaceRoot, 'config', 'agent-registry.json'),
            skillsConfig: (pathConfig === null || pathConfig === void 0 ? void 0 : pathConfig.skillsConfig) || path.join(workspaceRoot, 'config', 'skills-config.json')
        };
    }
    /**
     * 检测工作区根目录
     * 优先从环境变量读取，其次使用相对路径推导
     */
    detectWorkspaceRoot() {
        // 1. 从环境变量读取 (最优先)
        if (process.env.OPENCLAW_WORKSPACE) {
            return process.env.OPENCLAW_WORKSPACE;
        }
        // 2. 从当前文件路径推导 (相对路径)
        // __dirname 是 .../skills/ocw-intelligent-universe/factories/agent-factory
        // 向上三级到 workspace 根目录
        return path.resolve(__dirname, '../../../..');
    }
    /**
     * 请求 OpenClaw 大脑获取路径配置
     * 当自动检测失败时调用
     */
    requestPathConfigFromBrain() {
        return __awaiter(this, void 0, void 0, function* () {
            // 调用 OpenClaw 大脑获取当前环境的路径配置
            // 这里使用 sessions_spawn 或 exec 调用 openclaw 命令
            const { execSync } = require('child_process');
            try {
                const result = execSync('openclaw status --json', { encoding: 'utf-8' });
                const status = JSON.parse(result);
                return {
                    workspaceRoot: status.workspace || this.detectWorkspaceRoot(),
                    configDir: status.configDir || path.join(status.workspace || this.detectWorkspaceRoot(), 'config'),
                    agentRegistry: path.join(status.workspace || this.detectWorkspaceRoot(), 'config', 'agent-registry.json'),
                    skillsConfig: path.join(status.workspace || this.detectWorkspaceRoot(), 'config', 'skills-config.json')
                };
            }
            catch (e) {
                // 回退到自动检测
                return {
                    workspaceRoot: this.detectWorkspaceRoot(),
                    configDir: path.join(this.detectWorkspaceRoot(), 'config'),
                    agentRegistry: path.join(this.detectWorkspaceRoot(), 'config', 'agent-registry.json'),
                    skillsConfig: path.join(this.detectWorkspaceRoot(), 'config', 'skills-config.json')
                };
            }
        });
    }
    /**
     * 创建新 Agent
     */
    createAgent(config) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const newAgent = {
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
                message: `Agent ${config.id} 创建成功`,
                usedPaths: this.pathConfig
            };
        });
    }
    getAvailableModels() {
        try {
            const registry = JSON.parse(fs.readFileSync(this.pathConfig.agentRegistry, 'utf-8'));
            const allModels = [];
            for (const key in registry.available_models) {
                allModels.push(...registry.available_models[key]);
            }
            return allModels;
        }
        catch (e) {
            return [];
        }
    }
    getExistingAgents() {
        try {
            const registry = JSON.parse(fs.readFileSync(this.pathConfig.agentRegistry, 'utf-8'));
            return [...(registry.builtin_agents || []), ...(registry.virtual_agents || [])];
        }
        catch (e) {
            return [];
        }
    }
    registerAgent(agent) {
        const registry = JSON.parse(fs.readFileSync(this.pathConfig.agentRegistry, 'utf-8'));
        // 添加到 virtual_agents
        if (!registry.virtual_agents) {
            registry.virtual_agents = [];
        }
        registry.virtual_agents.push(agent);
        registry.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.pathConfig.agentRegistry, JSON.stringify(registry, null, 2), 'utf-8');
    }
    /**
     * 获取当前路径配置 (用于调试/验证)
     */
    getPathConfig() {
        return this.pathConfig;
    }
}
exports.AgentFactory = AgentFactory;
