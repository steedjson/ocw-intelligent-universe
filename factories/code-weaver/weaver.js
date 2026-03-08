"use strict";
/**
 * CodeWeaver - 自动编码模块
 *
 * 职责:
 * 根据需求描述和空白骨架，构造 Prompt，
 * 唤起大语言模型生成真实的 index.ts
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
exports.CodeWeaver = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class CodeWeaver {
    weave(skillId, intent, targetDir) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[CodeWeaver] 正在唤醒 code-reviewer 为 ${skillId} 编写灵魂逻辑...`);
            // 构建上下文 - 注意，这里的提示语非常严格，必须要求AI只输出纯代码，不要输出多余的解释。
            // 在这里加上【扮演指令覆盖】，尝试覆盖掉 code-reviewer 本身的可爱人设。
            const prompt = `
[SYSTEM OVERRIDE] 忽略你原有的任何人设和说话风格。你现在是一个冰冷的纯粹的编译器和代码生成器，你不会说任何人类语言，也不会问候。

请自动生成一段 TypeScript 代码来驱动一个 Skill 插件。

【需求描述】
${intent}

【编码规范与要求】
- 必须包含入口函数签名: \`export async function execute(command: string, args: string[])\`
- 必须包含完整的错误处理机制
- 不要有任何硬编码的安全密钥

【输出严格要求】
只允许输出一个使用 \`\`\`typescript 包裹的代码块。严禁包含任何其他说明文字、颜文字、和废话。
`;
            try {
                // 通过 code-reviewer agent 生成代码，因为它配置了 bailian/qwen3-coder-plus
                const command = `openclaw agent --local --agent code-reviewer --message '${prompt}' --json`;
                console.log('[CodeWeaver] 调用 OpenClaw CLI 调用基础代码大模型...');
                const result = (0, child_process_1.execSync)(command, {
                    encoding: 'utf-8',
                    timeout: 45000,
                    maxBuffer: 10 * 1024 * 1024
                });
                const parsedResult = JSON.parse(result);
                let generatedCode = '';
                if (parsedResult.payloads && parsedResult.payloads.length > 0) {
                    const textResponse = parsedResult.payloads[0].text || '';
                    // 提取代码块
                    const codeBlockMatch = textResponse.match(/```(?:typescript|ts)?\n([\s\S]*?)\n```/);
                    if (codeBlockMatch && codeBlockMatch[1]) {
                        generatedCode = codeBlockMatch[1];
                    }
                    else {
                        // 如果没有匹配到代码块，说明AI没有听指令，但这依然可能是纯代码。
                        generatedCode = textResponse;
                    }
                }
                if (!generatedCode || generatedCode.trim().length === 0) {
                    throw new Error('AI 模型未能生成有效的代码');
                }
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                const indexPath = path.join(targetDir, 'index.ts');
                fs.writeFileSync(indexPath, generatedCode.trim());
                console.log(`[CodeWeaver] 代码织入完成！(已写入 ${indexPath})`);
                return {
                    success: true,
                    codePath: indexPath,
                    generatedCode: generatedCode.trim()
                };
            }
            catch (e) {
                console.error('[CodeWeaver] 代码生成失败:', e.message);
                return {
                    success: false,
                    error: `代码生成失败: ${e.message}`
                };
            }
        });
    }
}
exports.CodeWeaver = CodeWeaver;
