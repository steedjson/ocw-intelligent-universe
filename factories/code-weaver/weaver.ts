/**
 * CodeWeaver - 自动编码模块
 * 
 * 职责:
 * 根据需求描述和空白骨架，构造 Prompt，
 * 唤起大语言模型生成真实的 index.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface CodeWeaverResult {
  success: boolean;
  codePath?: string;
  error?: string;
  generatedCode?: string;
}

export class CodeWeaver {
  public async weave(skillId: string, intent: string, targetDir: string): Promise<CodeWeaverResult> {
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
      
      const result = execSync(command, { 
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
        } else {
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
    } catch (e: any) {
      console.error('[CodeWeaver] 代码生成失败:', e.message);
      return { 
        success: false, 
        error: `代码生成失败: ${e.message}` 
      };
    }
  }
}
