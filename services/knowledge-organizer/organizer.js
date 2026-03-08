"use strict";
/**
 * 知识整理器
 *
 * 职责：
 * - 自动归类学习到的知识
 * - 合理归纳合并拆分
 * - 保持知识库逻辑清晰
 * - 原创思维与独立判断
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
exports.KnowledgeOrganizer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KnowledgeOrganizer {
    constructor(knowledgeBasePath) {
        this.knowledgeBasePath = knowledgeBasePath || path.join(__dirname, '../../ORGANIZED_KNOWLEDGE.json');
        this.categories = new Map();
        this.items = new Map();
        this.loadKnowledgeBase();
    }
    /**
     * 加载知识库
     */
    loadKnowledgeBase() {
        if (fs.existsSync(this.knowledgeBasePath)) {
            const data = JSON.parse(fs.readFileSync(this.knowledgeBasePath, 'utf-8'));
            // 加载分类
            for (const cat of data.categories || []) {
                this.categories.set(cat.name, cat);
            }
            // 加载知识项
            for (const item of data.items || []) {
                this.items.set(item.id, item);
            }
        }
        else {
            // 初始化默认分类
            this.initializeDefaultCategories();
        }
    }
    /**
     * 初始化默认分类
     */
    initializeDefaultCategories() {
        const defaultCategories = [
            {
                name: '配置类',
                description: 'OpenClaw 配置相关知识',
                items: [],
                subcategories: [
                    { name: 'Agent 配置', description: 'Agent 相关配置', items: [], subcategories: [] },
                    { name: 'Skill 配置', description: 'Skill 相关配置', items: [], subcategories: [] },
                    { name: '系统配置', description: '系统级配置', items: [], subcategories: [] }
                ]
            },
            {
                name: '规则类',
                description: '验证规则、业务规则等',
                items: [],
                subcategories: [
                    { name: '验证规则', description: '配置验证规则', items: [], subcategories: [] },
                    { name: '业务规则', description: '业务逻辑规则', items: [], subcategories: [] }
                ]
            },
            {
                name: '模板类',
                description: '各种模板',
                items: [],
                subcategories: [
                    { name: 'Agent 模板', description: 'Agent 配置模板', items: [], subcategories: [] },
                    { name: 'Skill 模板', description: 'Skill 配置模板', items: [], subcategories: [] }
                ]
            },
            {
                name: '经验类',
                description: '实践经验、最佳实践',
                items: [],
                subcategories: [
                    { name: '安装经验', description: '安装相关经验', items: [], subcategories: [] },
                    { name: '配置经验', description: '配置相关经验', items: [], subcategories: [] }
                ]
            },
            {
                name: '原创类',
                description: '原创思考和见解',
                items: [],
                subcategories: []
            }
        ];
        for (const cat of defaultCategories) {
            this.categories.set(cat.name, cat);
        }
        this.saveKnowledgeBase();
    }
    /**
     * 保存知识库
     */
    saveKnowledgeBase() {
        const data = {
            categories: Array.from(this.categories.values()),
            items: Array.from(this.items.values()),
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(this.knowledgeBasePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * 添加新知识
     */
    addKnowledge(content, topic, source) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[知识整理器] 添加新知识：${topic}`);
            // 1. 分析知识类型
            const category = this.analyzeKnowledgeType(content, topic);
            // 2. 创建知识项
            const item = {
                id: this.generateId(topic),
                topic,
                category,
                content,
                source: source,
                confidence: 1.0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                relatedTopics: [],
                tags: this.extractTags(content, topic)
            };
            // 3. 检查是否有相似知识
            const similarItems = this.findSimilarItems(item);
            if (similarItems.length > 0) {
                // 有相似知识，考虑合并
                return this.handleSimilarKnowledge(item, similarItems);
            }
            // 4. 无相似知识，直接添加
            this.items.set(item.id, item);
            this.addToCategory(item);
            this.saveKnowledgeBase();
            return {
                success: true,
                action: 'categorized',
                item,
                message: `知识已归类到 ${category}`
            };
        });
    }
    /**
     * 分析知识类型
     */
    analyzeKnowledgeType(content, topic) {
        // 根据内容特征判断类型
        const contentStr = JSON.stringify(content).toLowerCase();
        if (contentStr.includes('config') || contentStr.includes('配置')) {
            return '配置类';
        }
        if (contentStr.includes('rule') || contentStr.includes('规则') || contentStr.includes('validat')) {
            return '规则类';
        }
        if (contentStr.includes('template') || contentStr.includes('模板')) {
            return '模板类';
        }
        if (contentStr.includes('experience') || contentStr.includes('经验') || contentStr.includes('practice')) {
            return '经验类';
        }
        // 默认归类
        return '原创类';
    }
    /**
     * 提取标签
     */
    extractTags(content, topic) {
        const tags = [topic];
        // 从内容中提取关键词作为标签
        const contentStr = JSON.stringify(content);
        const keywords = contentStr.match(/[a-zA-Z\u4e00-\u9fa5]+/g) || [];
        // 去重并添加
        const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
        tags.push(...uniqueKeywords);
        return tags;
    }
    /**
     * 生成 ID
     */
    generateId(topic) {
        return `${topic}_${Date.now()}`;
    }
    /**
     * 查找相似知识
     */
    findSimilarItems(newItem) {
        const similar = [];
        for (const item of this.items.values()) {
            // 检查主题相似度
            if (this.isTopicSimilar(newItem.topic, item.topic)) {
                similar.push(item);
            }
            // 检查标签相似度
            const commonTags = newItem.tags.filter(t => item.tags.includes(t));
            if (commonTags.length >= 2) {
                similar.push(item);
            }
        }
        return similar;
    }
    /**
     * 判断主题是否相似
     */
    isTopicSimilar(topic1, topic2) {
        // 简化实现：检查是否包含相同关键词
        const keywords1 = topic1.toLowerCase().split(/[\s_-]+/);
        const keywords2 = topic2.toLowerCase().split(/[\s_-]+/);
        const common = keywords1.filter(k => keywords2.includes(k));
        return common.length >= 2;
    }
    /**
     * 处理相似知识
     */
    handleSimilarKnowledge(newItem, similarItems) {
        console.log(`[知识整理器] 发现 ${similarItems.length} 个相似知识，考虑合并`);
        // 判断是合并还是独立
        if (this.shouldMerge(newItem, similarItems)) {
            return this.mergeKnowledge(newItem, similarItems);
        }
        else {
            // 不合并，作为独立知识添加
            this.items.set(newItem.id, newItem);
            this.addToCategory(newItem);
            this.saveKnowledgeBase();
            return {
                success: true,
                action: 'categorized',
                item: newItem,
                message: `知识已独立归类（发现 ${similarItems.length} 个相似知识）`
            };
        }
    }
    /**
     * 判断是否应该合并
     */
    shouldMerge(newItem, similarItems) {
        // 合并条件：
        // 1. 主题高度相似
        // 2. 内容互补而非冲突
        // 3. 合并后更简洁
        // 简化实现：检查置信度和内容相似度
        const avgConfidence = similarItems.reduce((sum, item) => sum + item.confidence, 0) / similarItems.length;
        return avgConfidence > 0.7;
    }
    /**
     * 合并知识
     */
    mergeKnowledge(newItem, similarItems) {
        // 创建合并后的知识项
        const mergedItem = {
            id: this.generateId(`${newItem.topic}_merged`),
            topic: newItem.topic,
            category: newItem.category,
            content: this.mergeContent(newItem.content, similarItems.map(i => i.content)),
            source: 'original',
            confidence: 1.0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relatedTopics: [...new Set([newItem.topic, ...similarItems.flatMap(i => i.relatedTopics)])],
            tags: [...new Set([newItem.tags, ...similarItems.flatMap(i => i.tags)].flat())]
        };
        // 标记旧知识项为已合并
        for (const item of similarItems) {
            item.relatedTopics.push(mergedItem.topic);
            item.updatedAt = new Date().toISOString();
        }
        // 添加新知识项
        this.items.set(mergedItem.id, mergedItem);
        this.addToCategory(mergedItem);
        this.saveKnowledgeBase();
        return {
            success: true,
            action: 'merged',
            item: mergedItem,
            message: `已合并 ${similarItems.length + 1} 个相关知识`
        };
    }
    /**
     * 合并内容
     */
    mergeContent(newContent, oldContents) {
        // 简化实现：深度合并
        const merged = Object.assign({}, newContent);
        for (const old of oldContents) {
            for (const key in old) {
                if (!merged[key]) {
                    merged[key] = old[key];
                }
            }
        }
        return merged;
    }
    /**
     * 添加到分类
     */
    addToCategory(item) {
        const category = this.categories.get(item.category);
        if (category) {
            category.items.push(item);
        }
    }
    /**
     * 拆分知识
     */
    splitKnowledge(itemId, newTopics) {
        const item = this.items.get(itemId);
        if (!item) {
            return [];
        }
        const results = [];
        // 创建拆分后的知识项
        for (const topic of newTopics) {
            const newItem = {
                id: this.generateId(`${topic}_split`),
                topic,
                category: item.category,
                content: item.content,
                source: 'original',
                confidence: item.confidence,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                relatedTopics: item.relatedTopics,
                tags: item.tags
            };
            this.items.set(newItem.id, newItem);
            this.addToCategory(newItem);
            results.push({
                success: true,
                action: 'split',
                item: newItem,
                message: `知识已拆分到 ${topic}`
            });
        }
        // 标记原知识项为已拆分
        item.updatedAt = new Date().toISOString();
        this.saveKnowledgeBase();
        return results;
    }
    /**
     * 获取知识库概览
     */
    getKnowledgeOverview() {
        return {
            totalItems: this.items.size,
            categories: Array.from(this.categories.entries()).map(([name, cat]) => ({
                name,
                itemCount: cat.items.length,
                subcategoryCount: cat.subcategories.length
            })),
            lastUpdated: new Date().toISOString()
        };
    }
    /**
     * 查询知识
     */
    queryKnowledge(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        for (const item of this.items.values()) {
            // 查询主题
            if (item.topic.toLowerCase().includes(queryLower)) {
                results.push(item);
                continue;
            }
            // 查询标签
            if (item.tags.some(t => t.toLowerCase().includes(queryLower))) {
                results.push(item);
                continue;
            }
            // 查询内容
            const contentStr = JSON.stringify(item.content).toLowerCase();
            if (contentStr.includes(queryLower)) {
                results.push(item);
            }
        }
        return results;
    }
}
exports.KnowledgeOrganizer = KnowledgeOrganizer;
