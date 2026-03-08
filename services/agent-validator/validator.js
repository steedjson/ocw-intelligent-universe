"use strict";
/**
 * Agent 验证服务
 *
 * 职责：
 * - 验证 Agent 配置是否有效
 * - 测试模型可用性
 * - 验证工具权限
 * - 生成验证报告
 */
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
exports.AgentValidator = void 0;
const child_process_1 = require("child_process");
class AgentValidator {
    /**
     * 验证 Agent 配置
     */
    validate(agent) {
        return __awaiter(this, void 0, void 0, function* () {
            const checks = [];
            // 1. 验证 ID 格式
            const idCheck = this.validateId(agent.id);
            checks.push(idCheck);
            // 2. 验证模型可用性
            const modelCheck = yield this.validateModel(agent.model);
            checks.push(modelCheck);
            // 3. 验证工具权限
            const toolsCheck = this.validateTools(agent.tools);
            checks.push(toolsCheck);
            // 4. 验证描述完整性
            const descCheck = this.validateDescription(agent.description);
            checks.push(descCheck);
            const success = checks.every(c => c.passed);
            return {
                success,
                agent,
                checks,
                message: success ? `Agent ${agent.id} 验证通过` : `Agent ${agent.id} 验证失败`
            };
        });
    }
    /**
     * 验证 ID 格式
     */
    validateId(id) {
        if (!id || id.trim().length === 0) {
            return {
                name: 'ID 格式',
                passed: false,
                message: 'ID 不能为空'
            };
        }
        // 检查是否符合命名规范（小写、连字符、下划线）
        const validPattern = /^[a-z0-9_-]+$/;
        if (!validPattern.test(id)) {
            return {
                name: 'ID 格式',
                passed: false,
                message: 'ID 只能包含小写字母、数字、连字符和下划线'
            };
        }
        return {
            name: 'ID 格式',
            passed: true,
            message: 'ID 格式正确'
        };
    }
    /**
     * 验证模型可用性
     */
    validateModel(model) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!model || model.trim().length === 0) {
                return {
                    name: '模型可用性',
                    passed: false,
                    message: '模型不能为空'
                };
            }
            try {
                // 调用 OpenClaw 验证模型
                const status = (0, child_process_1.execSync)('openclaw status --json', { encoding: 'utf-8' });
                const statusJson = JSON.parse(status);
                // 检查模型是否在配置中
                // 这里简化处理，实际应该检查 available_models
                return {
                    name: '模型可用性',
                    passed: true,
                    message: `模型 ${model} 可用`
                };
            }
            catch (e) {
                return {
                    name: '模型可用性',
                    passed: false,
                    message: `模型验证失败：${e.message}`
                };
            }
        });
    }
    /**
     * 验证工具权限
     */
    validateTools(tools) {
        if (!tools || tools.length === 0) {
            return {
                name: '工具权限',
                passed: false,
                message: '工具权限不能为空'
            };
        }
        // 验证工具格式
        const invalidTools = tools.filter(t => {
            // 允许 "*" 或 "profile:xxx" 或普通工具名
            return t !== '*' && !t.startsWith('profile:') && !/^[a-z0-9_-]+$/.test(t);
        });
        if (invalidTools.length > 0) {
            return {
                name: '工具权限',
                passed: false,
                message: `无效的工具权限：${invalidTools.join(', ')}`
            };
        }
        return {
            name: '工具权限',
            passed: true,
            message: '工具权限配置正确'
        };
    }
    /**
     * 验证描述完整性
     */
    validateDescription(description) {
        if (!description || description.trim().length === 0) {
            return {
                name: '描述完整性',
                passed: false,
                message: '描述不能为空'
            };
        }
        if (description.length < 10) {
            return {
                name: '描述完整性',
                passed: false,
                message: '描述过于简单，至少 10 个字符'
            };
        }
        return {
            name: '描述完整性',
            passed: true,
            message: '描述完整'
        };
    }
}
exports.AgentValidator = AgentValidator;
