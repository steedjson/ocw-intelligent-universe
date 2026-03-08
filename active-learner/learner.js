"use strict";
/**
 * 主动学习器
 *
 * 职责：
 * - 主动学习未知配置
 * - 查询官方文档/权威知识
 * - 更新智能宇宙知识库
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
exports.ActiveLearner = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class ActiveLearner {
    constructor(knowledgeBasePath) {
        this.knowledgeBasePath = knowledgeBasePath || path.join(__dirname, '../../KNOWLEDGE_BASE.json');
        this.knowledgeBase = this.loadKnowledgeBase();
    }
    /**
     * 加载知识库
     */
    loadKnowledgeBase() {
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
    saveKnowledgeBase() {
        this.knowledgeBase.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.knowledgeBasePath, JSON.stringify(this.knowledgeBase, null, 2), 'utf-8');
    }
    /**
     * 主动学习未知配置
     */
    learnUnknownConfig(configKey, configValue) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[主动学习器] 开始学习未知配置：${configKey}`);
            // 1. 查询 OpenClaw 官方文档
            const officialDoc = yield this.searchOfficialDocs(configKey);
            if (officialDoc) {
                console.log(`[主动学习器] 从官方文档学习到：${configKey}`);
                return this.recordLearning(configKey, officialDoc, 'official');
            }
            // 2. 查询权威知识库
            const authorityKnowledge = yield this.searchAuthorityKnowledge(configKey);
            if (authorityKnowledge) {
                console.log(`[主动学习器] 从权威知识学习到：${configKey}`);
                return this.recordLearning(configKey, authorityKnowledge, 'authority');
            }
            // 3. 查询社区最佳实践
            const communityPractice = yield this.searchCommunityPractice(configKey);
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
        });
    }
    /**
     * 查询官方文档
     */
    searchOfficialDocs(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 尝试通过 OpenClaw 命令获取帮助
                const result = (0, child_process_1.execSync)(`openclaw help ${topic}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
                return {
                    source: 'official',
                    content: result,
                    url: `https://docs.openclaw.ai/search?q=${encodeURIComponent(topic)}`
                };
            }
            catch (e) {
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
        });
    }
    /**
     * 查询权威知识库
     */
    searchAuthorityKnowledge(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            // 这里可以实现调用外部权威 API
            // 例如 GitHub API、技术文档 API 等
            return null;
        });
    }
    /**
     * 查询社区最佳实践
     */
    searchCommunityPractice(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            // 这里可以实现查询社区实践
            return null;
        });
    }
    /**
     * 记录学习结果
     */
    recordLearning(topic, knowledge, source) {
        const result = {
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
    updateKnowledgeBase(topic, knowledge) {
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
    isConfigPattern(knowledge) {
        // 简化判断逻辑
        return true;
    }
    /**
     * 判断是否是验证规则
     */
    isValidationRule(knowledge) {
        // 简化判断逻辑
        return false;
    }
    /**
     * 判断是否是模板
     */
    isTemplate(knowledge) {
        // 简化判断逻辑
        return false;
    }
    /**
     * 获取知识库
     */
    getKnowledgeBase() {
        return this.knowledgeBase;
    }
    /**
     * 查询知识库
     */
    queryKnowledge(topic) {
        return this.knowledgeBase.configPatterns[topic] ||
            this.knowledgeBase.validationRules[topic] ||
            this.knowledgeBase.templates[topic];
    }
}
exports.ActiveLearner = ActiveLearner;
