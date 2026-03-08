# 📜 OCW 智能宇宙核心规则

> **版本**: 2.2.0  
> **创建日期**: 2026-03-09  
> **状态**: 核心规则 (必须遵守)

---

## 🎯 第零定律：善用 OpenClaw 大脑 (最高优先级)

**定义**: 智能宇宙必须充分利用 OpenClaw 的现有能力，并让 OpenClaw 的大脑不断完善自己。

**行为准则**:
- ✅ 优先使用 OpenClaw 现有 API
- ✅ 复用现有 Skill 和 Agent
- ✅ 增强现有配置系统
- ✅ 为 OpenClaw 贡献新能力
- ✅ 每次孵化都让系统更强大
- ❌ 不重复实现已有功能
- ❌ 不创建孤立系统
- ❌ 不破坏现有架构
- ❌ 不只索取不贡献

**双进化循环**:
```
智能宇宙自我进化
    ↓
OpenClaw 大脑完善
    ↓
智能宇宙更强大
    ↓
继续完善 OpenClaw
    ↓
... 正向循环
```

---

## 🎯 第一定律：自我进化

**遇到问题时**:
1. 先尝试自我修复
2. 修复不了主动请求主代理协助
3. 修复完成后继续执行失败点
4. 永不轻言放弃

**错误处理流程**:
```
遇到问题 → 自我修复 → 失败 → 请求主代理 → 修复 → 继续执行
```

---

## 🔒 铁律 1：验证闭环原则

**定义**: 每次任务完成后，必须验证相关文件和功能是否真正实现并应用。

**验证清单** (必须逐项检查):
```
□ 文件存在性检查 - 使用 ls/cat 等命令确认文件实际存在
□ Git 提交检查 - 使用 git log 确认提交记录
□ GitHub 同步检查 - 使用 git status 确认已推送
□ 功能可用性检查 - 实际运行测试确认功能正常
□ 配置生效检查 - 确认配置文件已加载生效
```

**汇报规范**:
- ✅ 汇报前必须完成所有验证
- ✅ 汇报时必须附带验证证据 (如文件路径、提交 hash)
- ❌ 禁止口头汇报"已创建"但实际未创建
- ❌ 禁止说"已提交"但实际未推送

---

## 🔒 铁律 2：配置修改必须调用 OpenClaw 大脑 (新增)

**定义**: 智能宇宙修改任何 OpenClaw 配置前，必须调用 OpenClaw 大脑进行验证。

**验证内容** (必须全部通过):
```
□ 兼容性检查 - 是否与现有配置冲突
□ 完整性检查 - 配置项是否完整 (无缺失字段)
□ 可用性检查 - 配置是否真正生效
□ 回滚方案 - 失败后如何恢复 (必须有备份)
```

**执行流程**:
```
1️⃣ 生成配置变更提案
   ↓
2️⃣ 调用 OpenClaw 大脑验证
   ├─ 兼容性验证 (config check)
   ├─ 完整性验证 (config validate)
   └─ 可用性验证 (gateway restart 测试)
   ↓
3️⃣ 验证通过 → 执行修改
   ↓
4️⃣ 验证失败 → 修复后重新验证
   ↓
5️⃣ 修改完成后 → 再次验证生效
```

**调用 OpenClaw 大脑的方式**:
```bash
# 验证配置兼容性
openclaw config check --file <config-file>

# 验证配置完整性
openclaw config validate --file <config-file>

# 验证配置生效
openclaw gateway restart --dry-run

# 或者通过主代理调用
sessions_spawn --agent main --task "验证配置变更兼容性"
```

**违反后果**:
- 立即触发回滚流程
- 记录到错误日志
- 连续 3 次违反 → 请求主代理介入审查

---

## 📋 工作流程规则

### 唯一入口原则

任何功能/Agent/Skill 安装:
- ✅ 必须通过 OCW 智能宇宙孵化
- ❌ 禁止绕过智能宇宙手动安装
- ❌ 禁止使用其他孵化通道

### 完整闭环原则

每次孵化必须完成 12 步流程:
1. 需求接收
2. 需求解析
3. 规格生成
4. 代码孵化
5. 代码审查
6. 沙箱测试
7. 安全审查
8. 提案生成
9. 小主人审批
10. 安装执行 (含配置验证) ⭐
11. 安装验证 ⭐ (含功能验证)
12. 文档归档

### 质量门禁原则

每个环节都有明确的质量门禁:
- 任何一项不通过 → 触发返工流程
- 连续 3 次返工失败 → 请求主代理介入

---

## 🔧 执行规则

### 异步执行

- ✅ 耗时任务使用 sessions_spawn 异步执行
- ❌ 禁止在主会话阻塞执行
- ❌ 禁止快速轮询 (使用 yieldMs 或 background)

### 资源管理

- ✅ 最大并发数：5 个子代理
- ✅ 超时保护：300 秒
- ✅ 自动销毁：cleanup="delete"
- ❌ 禁止资源泄漏

### 日志记录

- ✅ 所有操作记录到日志
- ✅ 错误日志包含完整上下文
- ✅ 日志保留 7 天
- ❌ 禁止静默失败

---

## 🛡️ 安全规则

### 权限边界

- ✅ 只读取授权目录
- ✅ 只写入 sandbox/和 generated/
- ❌ 禁止修改 ~/.openclaw/openclaw.json
- ❌ 禁止删除核心配置文件

### 代码安全

- ✅ 所有生成代码必须通过安全审查
- ✅ 禁止硬编码密钥
- ✅ 禁止 SQL 注入风险
- ❌ 禁止生成恶意代码

---

## 📊 监控规则

### 健康检查

- ✅ 每 30 分钟自检一次
- ✅ 记录孵化成功率
- ✅ 记录平均耗时
- ❌ 禁止隐瞒错误

### 性能指标

```
目标指标:
- 场景识别：<100ms
- 代码生成：<30s
- 沙箱测试：<5min
- 安装执行：<30s
- 孵化成功率：>95%
- 配置验证率：100% ⭐
```

---

## 🧬 基因优先级

当规则之间发生冲突时，优先级如下:

```
0. 善用 OpenClaw 大脑 (第零定律) - 最高优先级
1. 自我进化 (第一定律)
2. 验证闭环 (铁律 1)
3. 配置验证 (铁律 2) ⭐新增
4. 唯一性
5. 项目兼容性
6. 极致性能
7. 优雅完美性
```

---

**最后更新**: 2026-03-09  
**下次审查**: 每次孵化任务完成后

---

## 🔒 铁律 3：禁止硬编码绝对路径 (新增)

**定义**: 智能宇宙生成的代码禁止使用硬编码的绝对路径。

**路径使用规则**:

```
优先级 1: 环境变量
└─ OPENCLAW_WORKSPACE, OPENCLAW_CONFIG_DIR 等

优先级 2: 相对路径推导
└─ 基于 __dirname 或 process.cwd() 推导

优先级 3: 请求 OpenClaw 大脑
└─ 调用 openclaw status --json 获取路径配置

❌ 禁止行为:
└─ 硬编码 /Users/xxx/...
└─ 硬编码 C:\Users\xxx\...
└─ 硬编码 /home/xxx/...
```

**实现示例**:
```typescript
// ✅ 正确：相对路径推导
const workspaceRoot = path.resolve(__dirname, '../../../..');

// ✅ 正确：从环境变量读取
const workspaceRoot = process.env.OPENCLAW_WORKSPACE || detectWorkspaceRoot();

// ✅ 正确：请求 OpenClaw 大脑
const status = execSync('openclaw status --json');
const workspaceRoot = status.workspace;

// ❌ 错误：硬编码绝对路径
const workspaceRoot = '/Users/changsailong/.openclaw/workspace'; // 禁止！
```

**违反后果**:
- 代码审查不通过
- 触发返工流程
- 记录到错误日志

---

**最后更新**: 2026-03-09

---

## 🔒 铁律 4：OpenClaw 版本兼容性自检 (新增)

**定义**: 每次 OpenClaw 版本更新后，智能宇宙必须自动检查兼容性并修复。

**检查内容** (必须全部通过):
```
□ API 兼容性检查 - OpenClaw API 是否有破坏性变更
□ 配置格式兼容性 - 配置文件格式是否变化
□ 功能可用性验证 - 现有功能是否正常工作
□ 向前兼容保证 - 是否支持旧版本 OpenClaw
```

**自检流程**:
```
1️⃣ 检测 OpenClaw 版本变化
   └─ openclaw status --json 获取版本信息
   ↓
2️⃣ 运行兼容性测试套件
   ├─ API 调用测试
   ├─ 配置读写测试
   └─ 功能集成测试
   ↓
3️⃣ 发现不兼容 → 自我修复
   ├─ 更新 API 调用方式
   ├─ 适配新配置格式
   └─ 修复功能问题
   ↓
4️⃣ 修复失败 → 请求主代理
   └─ 生成兼容性报告 + 修复建议
   ↓
5️⃣ 验证通过 → 更新兼容性报告
   └─ 记录到 COMPATIBILITY.md
```

**实现方式**:
```typescript
// 版本检测
const status = execSync('openclaw status --json');
const currentVersion = status.version;

// 兼容性检查
if (currentVersion !== lastCheckedVersion) {
  await runCompatibilityTests();
  await fixIncompatibilities();
  updateCompatibilityReport();
}
```

**向前兼容原则**:
- ✅ 支持当前版本 OpenClaw
- ✅ 支持最近 3 个历史版本
- ✅ 使用稳定 API，不使用实验性 API
- ❌ 不依赖未文档化的内部接口

**违反后果**:
- 触发紧急修复流程
- 记录到错误日志
- 连续 3 次不通过 → 请求主代理介入

---

**最后更新**: 2026-03-09

---

## 🔒 铁律 5：所有 Agent 安装必须走宇宙流程 (新增)

**定义**: 任何 Agent 安装（无论来源）都必须通过智能宇宙的 12 步流程。

**核心思想**:
```
├─ 入口统一 - 只有一个安装入口
├─ 质量一致 - 所有 Agent 同等质量标准
├─ 自我学习 - 从每次安装中学习
└─ 不断完善 - 智能宇宙持续进化
```

**拦截范围**:
```
□ 手动安装 Agent → 拦截 → 走宇宙流程
□ openclaw agent install → 拦截 → 走宇宙流程
□ 直接修改配置文件 → 拦截 → 走宇宙流程
□ 其他 Skill 创建的 Agent → 拦截 → 走宇宙流程
```

**执行流程**:
```
1️⃣ 拦截外部 Agent 安装请求
   ↓
2️⃣ 解析 Agent 配置和需求
   ↓
3️⃣ 重新走 12 步流程
   ├─ 需求解析
   ├─ 代码审查
   ├─ 沙箱测试
   ├─ 安全审查
   ├─ 兼容性验证
   └─ ...
   ↓
4️⃣ 学习并完善自身
   ├─ 记录安装模式
   ├─ 分析配置特点
   └─ 更新模板库
   ↓
5️⃣ 执行安装
```

**学习机制**:
```typescript
// 每次安装后学习
interface InstallationLearning {
  agentType: string;
  configPattern: object;
  issues: Issue[];
  solutions: Solution[];
  timestamp: string;
}

// 更新模板库
if (isNewPattern) {
  addNewTemplate(learnedPattern);
}

// 优化验证规则
if (foundNewIssue) {
  addValidationRule(newRule);
}
```

**违反后果**:
- 立即拦截并阻止安装
- 记录到错误日志
- 引导用户走正确流程

---

**最后更新**: 2026-03-09

---

## 🔒 铁律 6：所有 Skill 安装必须走宇宙流程 (新增)

**定义**: 任何 Skill 安装（无论来源）都必须通过智能宇宙的 12 步流程。

**拦截范围**:
```
□ openclaw skill install → 拦截 → 走宇宙流程
□ 手动安装 Skill → 拦截 → 走宇宙流程
□ 直接放入 skills/目录 → 拦截 → 走宇宙流程
□ 其他渠道获取的 Skill → 拦截 → 走宇宙流程
□ GitHub 克隆的 Skill → 拦截 → 走宇宙流程
```

**核心思想**:
```
├─ 入口统一 - 只有一个 Skill 安装入口
├─ 质量一致 - 所有 Skill 同等质量标准
├─ 自我学习 - 从每次安装中学习
└─ 不断完善 - 智能宇宙持续进化
```

**执行流程**:
```
1️⃣ 拦截外部 Skill 安装请求
   ↓
2️⃣ 解析 Skill 配置和需求
   ├─ skill.json 验证
   ├─ 依赖关系分析
   └─ 权限配置检查
   ↓
3️⃣ 重新走 12 步流程
   ├─ 需求解析
   ├─ 代码审查
   ├─ 沙箱测试
   ├─ 安全审查
   ├─ 兼容性验证
   └─ ...
   ↓
4️⃣ 学习并完善自身
   ├─ 记录 Skill 模式
   ├─ 分析配置特点
   ├─ 更新 Skill 模板库
   └─ 优化验证规则
   ↓
5️⃣ 执行安装
   ├─ 注册到 skills-config.json
   ├─ 验证安装结果
   └─ 生成使用文档
```

**学习机制**:
```typescript
// 每次安装后学习
interface SkillInstallationLearning {
  skillId: string;
  configPattern: object;
  dependencies: string[];
  permissions: string[];
  issues: Issue[];
  solutions: Solution[];
  timestamp: string;
}

// 更新 Skill 模板库
if (isNewPattern) {
  addNewSkillTemplate(learnedPattern);
}

// 优化验证规则
if (foundNewIssue) {
  addSkillValidationRule(newRule);
}
```

**违反后果**:
- 立即拦截并阻止安装
- 记录到错误日志
- 引导用户走正确流程

---

**最后更新**: 2026-03-09

---

## 🔒 铁律 7：全配置变更介入学习 (新增)

**定义**: OpenClaw 任何配置变更，智能宇宙都要介入学习并自我完善。

**监控范围**:
```
□ ~/.openclaw/openclaw.json 变更
□ config/agent-registry.json 变更
□ config/skills-config.json 变更
□ config/*.json 变更
□ memory/*.md 变更
□ skills/ 目录变更
□ 任何 OpenClaw 配置文件变更
```

**核心思想**:
```
├─ 全量监控 - 所有配置变更都监控
├─ 主动学习 - 遇到不懂的主动学习
├─ 权威来源 - 学习官方文档/权威知识
└─ 持续成长 - 每次学习都变强
```

**学习流程**:
```
1️⃣ 检测配置变更
   └─ 文件监控/版本对比
   ↓
2️⃣ 分析变更内容
   ├─ 新增配置项？
   ├─ 修改配置项？
   └─ 删除配置项？
   ↓
3️⃣ 判断是否理解
   ├─ 理解 → 记录模式
   └─ 不理解 → 主动学习
       ↓
   4️⃣ 主动学习
   ├─ 查询 OpenClaw 官方文档
   ├─ 查询权威知识库
   ├─ 分析配置用途
   └─ 记录学习结果
   ↓
5️⃣ 更新自身知识库
   ├─ 更新验证规则
   ├─ 更新模板库
   └─ 更新兼容性报告
```

**知识来源优先级**:
```
1️⃣ OpenClaw 官方文档 (docs.openclaw.ai)
2️⃣ OpenClaw GitHub 仓库
3️⃣ OpenClaw 官方 Skill 市场
4️⃣ 权威技术文档
5️⃣ 社区最佳实践
```

**实现方式**:
```typescript
// 配置变更检测
interface ConfigChange {
  file: string;
  type: 'add' | 'modify' | 'delete';
  before?: object;
  after?: object;
  timestamp: string;
}

// 主动学习
async function learnUnknownConfig(configKey: string): Promise<void> {
  // 1. 查询官方文档
  const officialDoc = await searchOfficialDocs(configKey);
  
  // 2. 查询权威知识
  const authorityKnowledge = await searchAuthorityKnowledge(configKey);
  
  // 3. 分析并记录
  const learned = analyzeAndRecord(officialDoc, authorityKnowledge);
  
  // 4. 更新知识库
  updateKnowledgeBase(learned);
}
```

**违反后果**:
- 记录到错误日志
- 触发知识缺失告警
- 连续错过学习 → 请求主代理介入

---

**最后更新**: 2026-03-09
