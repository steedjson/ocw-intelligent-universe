"use strict";
/**
 * Agent 注册服务
 *
 * 职责：
 * - 将 Agent 注册到 OpenClaw
 * - 更新 agent-registry.json
 * - 验证注册结果
 * - 支持回滚操作
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistrar = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AgentRegistrar {
    constructor(registryPath) {
        this.agentRegistryPath = registryPath || this.detectRegistryPath();
    }
    /**
     * 检测 agent-registry.json 路径
     */
    detectRegistryPath() {
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
    register(agent) {
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
            const existingIndex = registry.virtual_agents.findIndex((a) => a.id === agent.id);
            if (existingIndex !== -1) {
                // 更新现有 Agent
                registry.virtual_agents[existingIndex] = agent;
            }
            else {
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
        }
        catch (e) {
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
    unregister(agentId) {
        try {
            // 1. 备份现有配置
            const backupPath = this.createBackup();
            // 2. 读取现有配置
            const registry = JSON.parse(fs.readFileSync(this.agentRegistryPath, 'utf-8'));
            // 3. 从 virtual_agents 中移除
            if (registry.virtual_agents) {
                const initialLength = registry.virtual_agents.length;
                registry.virtual_agents = registry.virtual_agents.filter((a) => a.id !== agentId);
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
        }
        catch (e) {
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
    rollback(backupPath) {
        try {
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, this.agentRegistryPath);
                return true;
            }
            return false;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * 创建备份
     */
    createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${this.agentRegistryPath}.bak.${timestamp}`;
        fs.copyFileSync(this.agentRegistryPath, backupPath);
        return backupPath;
    }
    /**
     * 获取注册路径 (用于调试/验证)
     */
    getRegistryPath() {
        return this.agentRegistryPath;
    }
}
exports.AgentRegistrar = AgentRegistrar;
