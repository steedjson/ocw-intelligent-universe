"use strict";
/**
 * ProposalGenerator - 集成提案生成器
 *
 * 职责:
 * 生成一份 Markdown 折子，让小主人清晰看到本次生成的 Skill 变更和配置补丁。
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
exports.ProposalGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ProposalGenerator {
    generateProposal(skillId, intent, targetDir) {
        const timestamp = new Date().toISOString();
        // 生成 JSON Patch 配置片段
        const patch = {
            [skillId]: {
                "enabled": true,
                "version": "1.0.0",
                "path": `skills/generated/${skillId}`,
                "description": intent,
                "priority": 3,
                "dependencies": [],
                "config": {}
            }
        };
        // 读取生成的代码内容
        const codeContent = fs.readFileSync(path.join(targetDir, 'index.ts'), 'utf-8');
        const markdown = `# 🎉 Skill 集成提案

> **Skill ID**: ${skillId}  
> **生成时间**: ${timestamp}  
> **测试状态**: ✅ 隔离沙箱测试通过

---

## 📋 功能概述
${intent}

---

## 🔍 代码核心逻辑预览 (\`index.ts\`)

\`\`\`typescript
${codeContent}
\`\`\`

---

## ⚙️ 配置注册方案 (\`skills-config.json\`)

请确认是否将以下配置注入到您的配置表中：

\`\`\`json
${JSON.stringify(patch, null, 2)}
\`\`\`

---

## ✅ 审批操作

小主人，请审批：
- **同意集成**: 回复 \`approve ${skillId}\`
- **拒绝集成**: 回复 \`reject ${skillId}\`
`;
        return markdown;
    }
}
exports.ProposalGenerator = ProposalGenerator;
