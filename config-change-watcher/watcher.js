"use strict";
/**
 * 配置变更监控器
 *
 * 职责：
 * - 监控所有 OpenClaw 配置文件变更
 * - 记录变更历史
 * - 触发学习流程
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
exports.ConfigChangeWatcher = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigChangeWatcher {
    constructor(config) {
        const workspaceRoot = this.detectWorkspaceRoot();
        this.config = {
            watchPaths: (config === null || config === void 0 ? void 0 : config.watchPaths) || [
                path.join(workspaceRoot, 'config', 'agent-registry.json'),
                path.join(workspaceRoot, 'config', 'skills-config.json'),
                path.join(workspaceRoot, 'memory'),
                path.join(workspaceRoot, 'skills')
            ],
            checkIntervalMs: (config === null || config === void 0 ? void 0 : config.checkIntervalMs) || 30000, // 30 秒
            historyLogPath: (config === null || config === void 0 ? void 0 : config.historyLogPath) || path.join(__dirname, '../../CONFIG_CHANGE_HISTORY.json')
        };
        this.fileSnapshots = new Map();
        this.changeHistory = [];
        this.isWatching = false;
        // 加载历史记录
        this.loadHistory();
    }
    /**
     * 检测工作区根目录
     */
    detectWorkspaceRoot() {
        if (process.env.OPENCLAW_WORKSPACE) {
            return process.env.OPENCLAW_WORKSPACE;
        }
        return path.resolve(__dirname, '../../../..');
    }
    /**
     * 开始监控
     */
    startWatching() {
        if (this.isWatching) {
            return;
        }
        console.log('[配置监控器] 开始监控配置变更...');
        this.isWatching = true;
        // 初始化快照
        this.captureSnapshots();
        // 定时检查
        this.checkInterval = setInterval(() => {
            this.checkChanges();
        }, this.config.checkIntervalMs);
    }
    /**
     * 停止监控
     */
    stopWatching() {
        if (!this.isWatching) {
            return;
        }
        console.log('[配置监控器] 停止监控');
        this.isWatching = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
    /**
     * 捕获文件快照
     */
    captureSnapshots() {
        for (const watchPath of this.config.watchPaths) {
            if (fs.existsSync(watchPath)) {
                const stats = fs.statSync(watchPath);
                if (stats.isFile()) {
                    const content = fs.readFileSync(watchPath, 'utf-8');
                    this.fileSnapshots.set(watchPath, content);
                }
                else if (stats.isDirectory()) {
                    // 目录则记录所有文件
                    this.captureDirectorySnapshot(watchPath);
                }
            }
        }
    }
    /**
     * 捕获目录快照
     */
    captureDirectorySnapshot(dirPath) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile() && (file.endsWith('.json') || file.endsWith('.md'))) {
                const content = fs.readFileSync(filePath, 'utf-8');
                this.fileSnapshots.set(filePath, content);
            }
            else if (stats.isDirectory()) {
                this.captureDirectorySnapshot(filePath);
            }
        }
    }
    /**
     * 检查变更
     */
    checkChanges() {
        const changes = [];
        for (const [filePath, oldContent] of this.fileSnapshots.entries()) {
            if (!fs.existsSync(filePath)) {
                // 文件被删除
                changes.push({
                    file: filePath,
                    type: 'delete',
                    before: JSON.parse(oldContent),
                    after: undefined,
                    timestamp: new Date().toISOString(),
                    analyzed: false,
                    learned: false
                });
            }
            else {
                const newContent = fs.readFileSync(filePath, 'utf-8');
                if (newContent !== oldContent) {
                    // 文件被修改
                    changes.push({
                        file: filePath,
                        type: 'modify',
                        before: JSON.parse(oldContent),
                        after: JSON.parse(newContent),
                        timestamp: new Date().toISOString(),
                        analyzed: false,
                        learned: false
                    });
                }
            }
        }
        // 检查新文件
        for (const watchPath of this.config.watchPaths) {
            if (fs.existsSync(watchPath)) {
                const stats = fs.statSync(watchPath);
                if (stats.isFile() && !this.fileSnapshots.has(watchPath)) {
                    const content = fs.readFileSync(watchPath, 'utf-8');
                    changes.push({
                        file: watchPath,
                        type: 'add',
                        before: undefined,
                        after: JSON.parse(content),
                        timestamp: new Date().toISOString(),
                        analyzed: false,
                        learned: false
                    });
                }
                else if (stats.isDirectory()) {
                    this.checkNewFilesInDirectory(watchPath, changes);
                }
            }
        }
        // 处理变更
        for (const change of changes) {
            this.handleChange(change);
        }
        // 更新快照
        if (changes.length > 0) {
            this.captureSnapshots();
        }
    }
    /**
     * 检查目录中的新文件
     */
    checkNewFilesInDirectory(dirPath, changes) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile() && (file.endsWith('.json') || file.endsWith('.md'))) {
                if (!this.fileSnapshots.has(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    changes.push({
                        file: filePath,
                        type: 'add',
                        before: undefined,
                        after: JSON.parse(content),
                        timestamp: new Date().toISOString(),
                        analyzed: false,
                        learned: false
                    });
                }
            }
            else if (stats.isDirectory()) {
                this.checkNewFilesInDirectory(filePath, changes);
            }
        }
    }
    /**
     * 处理变更
     */
    handleChange(change) {
        console.log(`[配置监控器] 检测到配置变更：${change.file} (${change.type})`);
        // 添加到历史记录
        this.changeHistory.push(change);
        this.saveHistory();
        // 触发学习流程
        this.triggerLearning(change);
    }
    /**
     * 触发学习流程
     */
    triggerLearning(change) {
        // 这里调用 ActiveLearner 进行学习
        console.log(`[配置监控器] 触发学习流程：${change.file}`);
        // 实际实现会调用 ActiveLearner
    }
    /**
     * 加载历史记录
     */
    loadHistory() {
        if (fs.existsSync(this.config.historyLogPath)) {
            try {
                this.changeHistory = JSON.parse(fs.readFileSync(this.config.historyLogPath, 'utf-8'));
            }
            catch (e) {
                this.changeHistory = [];
            }
        }
    }
    /**
     * 保存历史记录
     */
    saveHistory() {
        // 只保留最近 100 条记录
        const recentHistory = this.changeHistory.slice(-100);
        fs.writeFileSync(this.config.historyLogPath, JSON.stringify(recentHistory, null, 2), 'utf-8');
    }
    /**
     * 获取变更历史
     */
    getChangeHistory(limit = 10) {
        return this.changeHistory.slice(-limit);
    }
}
exports.ConfigChangeWatcher = ConfigChangeWatcher;
