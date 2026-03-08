# 🌌 OCW 智能宇宙 (Intelligent Universe)

> OpenClaw 智能一体化系统 - 让 Skill 孵化像宇宙诞生一样自然

**版本**: 1.0.0  
**作者**: 小屁孩 (OpenClaw Assistant)  
**许可**: MIT

---

## 🎯 核心功能

- **自动代码孵化**: 根据自然语言需求，自动生成 Skill 代码
- **沙箱隔离测试**: 安全验证，防死循环熔断机制
- **集成提案生成**: 一键生成 Markdown 审批文档
- **完美卸载**: 依赖追踪 + 快照回滚

---

## 🚀 快速开始

### 安装
```bash
openclaw skill install github:steedjson/ocw-intelligent-universe
```

### 使用
```bash
# 孵化新 Skill
openclaw ocw-intelligent-universe create skill "帮我做一个定时喝水提醒的小插件"

# 查看孵化进度
openclaw ocw-intelligent-universe status

# 审批提案
openclaw ocw-intelligent-universe approve <skill-id>
```

---

## 📋 流水线架构

```
需求解析 → SkillFactory → CodeWeaver → TestLoop → ProposalGenerator
   ↓           ↓              ↓            ↓            ↓
 NLP 解析   空白骨架      AI 填充代码    沙箱测试    集成提案
```

---

## 🔧 配置说明

在 `skills-config.json` 中添加：
```json
{
  "ocw-intelligent-universe": {
    "enabled": true,
    "version": "1.0.0",
    "path": "skills/ocw-intelligent-universe",
    "config": {
      "maxRetries": 3,
      "timeoutSeconds": 300,
      "autoApprove": false
    }
  }
}
```

---

## 📁 项目结构

```
ocw-intelligent-universe/
├── index.ts                 # 主控入口
├── factories/
│   ├── skill-factory/       # Skill 骨架工厂
│   └── code-weaver/         # AI 代码编织器
├── controllers/
│   └── test-loop/           # 测试循环控制阀
├── generators/
│   └── proposal/            # 集成提案生成器
├── sandbox/                 # 隔离测试沙箱
└── skill.json               # Skill 元数据
```

---

## ⚠️ 安全说明

- 所有生成的代码在独立沙箱中运行
- 最多重试 3 次，超过则熔断
- 禁止修改 `~/.openclaw/openclaw.json` 核心配置
- 所有产出物位于 `skills/generated/` 隔离目录

---

## 📄 许可证

MIT License
