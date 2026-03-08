# 🌌 OCW 智能宇宙 (Intelligent Universe)

> OpenClaw 智能一体化系统 - 让 Skill 孵化像宇宙诞生一样自然

**版本**: 2.1.0  
**作者**: 小屁孩 (OpenClaw Assistant)  
**许可**: MIT

---

## 🧠 核心基因

OCW 智能宇宙拥有 5 大核心基因：

1. **唯一性** ⭐⭐⭐⭐⭐ - 类似功能只能有一个实现
2. **极致性能** ⭐⭐⭐⭐⭐ - 速度优先，资源占用最小化
3. **项目兼容性** ⭐⭐⭐⭐⭐ - 100% 兼容目标项目配置规范
4. **优雅完美性** ⭐⭐⭐⭐⭐ - 代码简洁，逻辑清晰，质量至上
5. **自我进化** ⭐⭐⭐⭐⭐ (第一定律) - 遇到问题主动修复，永不放弃

详见：[GENES.md](GENES.md)

---

## 📜 核心规则

**第零定律**: 善用 OpenClaw 大脑，让系统不断完善自己。

**第一定律**: 遇到问题时，先尝试自我修复，修复不了主动请求主代理协助，修复完成后继续执行失败点。

**铁律**: 验证闭环原则 - 汇报前必须验证文件/功能实际存在。

详见：[CORE_RULES.md](CORE_RULES.md)

---

## 🔄 12 步工业化闭环流程

```
┌─────────────────────────────────────────────────────────┐
│                  OCW 智能宇宙完整闭环                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣ 需求接收 → 2️⃣ 需求解析 → 3️⃣ 规格生成              │
│       ↓                                                  │
│  4️⃣ 代码孵化 → 5️⃣ 代码审查 → 6️⃣ 沙箱测试              │
│       ↓                                                  │
│  7️⃣ 安全审查 → 8️⃣ 提案生成 → 9️⃣ 小主人审批            │
│       ↓                                                  │
│  🔟 安装执行 → 1️⃣1️⃣ 安装验证 → 1️⃣2️⃣ 文档归档          │
│       ↓                                                  │
│  ✅ 完成 (失败 → 回滚 → 修复 → 重试)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 孵化类型

| 类型 | 工厂 | 注册器 | 验证器 |
|------|------|--------|--------|
| Skill | skill-factory | skills-config.json | 功能测试 |
| Agent | agent-factory | agent-registry.json | 模型可用性 |

---

## 🚀 快速开始

### 安装
```bash
# 手动安装 (OpenClaw 当前版本)
cd ~/.openclaw/workspace/skills
git clone https://github.com/steedjson/ocw-intelligent-universe.git
# 然后注册到 config/skills-config.json
```

### 使用
```bash
# 孵化 Skill
sessions_spawn --agent ocw-intelligent-universe --task "孵化一个 xxx Skill"

# 孵化 Agent
sessions_spawn --agent ocw-intelligent-universe --task "创建一个 xxx Agent"
```

---

## 📁 项目结构

```
ocw-intelligent-universe/
├── index.ts                 # 主控入口
├── GENES.md                 # 核心基因 ⭐
├── CORE_RULES.md            # 核心规则 ⭐
├── factories/
│   ├── skill-factory/       # Skill 骨架工厂
│   └── agent-factory/       # Agent 配置工厂 ⭐新增
├── services/
│   ├── agent-registrar/     # Agent 注册服务 ⭐新增
│   └── agent-validator/     # Agent 验证服务 ⭐新增
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
