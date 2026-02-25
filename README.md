# AI 小说创作系统

[![npm version](https://img.shields.io/npm/v/create-ai-novel-workspace)](https://www.npmjs.com/package/create-ai-novel-workspace)

一个平台无关的 AI 辅助小说创作工作区。通过结构化的文风分析、项目记忆管理和渐进式规则积累，实现风格稳定、前后一致的长篇小说创作。

## 它解决什么问题

- **文风不稳定**：AI 写作风格飘忽不定 → 通过预处理大量样本文本提取结构化文风指南，每次创作时严格参照
- **AI 吃书**：AI 写出与前文矛盾的内容 → 通过章节事实摘要、角色状态快照、伏笔追踪和独立验证子代理进行防护
- **跨会话遗忘**：换个会话就忘了设定 → 所有设定、决策、规则持久化为文件，每次创作自动加载
- **无法积累经验**：同样的问题反复出现 → 四级规则系统（全局 → 语言 → 文风 → 项目）渐进积累创作偏好和禁忌

## 支持平台

| 平台 | 适配方式 | 子代理支持 |
|------|----------|-----------|
| Cursor | `.cursorrules`（自动加载） | 有（Task tool） |
| Claude Code | `CLAUDE.md`（自动加载） | 有 |
| ChatGPT / 其他网页版 | `system-prompt.md`（手动配置） | 无（使用降级路径） |
| API 直接调用 | `system-prompt.md`（注入 system message） | 可通过代码模拟 |

## 快速开始

### 第一步：准备工作区

**一键创建（推荐）**

```bash
bun create ai-novel-workspace my-novel
```

或者：

```bash
bunx create-ai-novel-workspace my-novel
```

交互式引导创建完整工作区，包含工作流、模板、规则文件和平台适配文件。

也可以指定参数跳过交互：

```bash
bunx create-ai-novel-workspace init --dir my-novel --platform all -y
```

> 内容文件在运行时从 GitHub 拉取，始终获得最新版本。CLI 工具本身极小，安装几乎无感。

**已有工作区，生成平台适配**

```bash
cd my-novel
bunx create-ai-novel-workspace setup --platform cursor
```

### 第二步：创建文风

1. 准备你想模仿的小说样本文件（`.txt` 格式，建议 3-5 篇，总计 5 万字以上）
2. 创建文风目录并放入样本：

```
styles/my-style/
└── raw-samples/
    ├── sample-01.txt
    ├── sample-02.txt
    └── sample-03.txt
```

3. 告诉 AI：「分析文风」或使用 `/new-style` 命令
4. AI 会逐维度分析样本，生成 `style-guide.md` 和 `excerpts/` 分类摘录
5. 审阅分析结果，AI 会写一段测试文字供你对比原作
6. 满意后锁定文风指南

### 第三步：创建项目

告诉 AI：「新建项目」或使用 `/new-project`，AI 会引导你完成：

1. 输入项目名称（英文，如 `my-wuxia-novel`）
2. 选择文风（从已创建的文风中选择）
3. 选择语言（默认 `zh-CN`）
4. 选择大纲模式：
   - **详细大纲**：按章节规划
   - **连载模式**：仅设定大框架，逐章即兴
   - **无大纲**：直接开写

创建完成后，项目结构如下：

```
projects/my-wuxia-novel/
├── project.yaml          # 项目配置
├── project-rules.md      # 项目专属规则（初始为空）
├── memory/               # 项目记忆
│   ├── characters.md     # 角色档案
│   ├── world.md          # 世界观设定
│   ├── outline.md        # 故事大纲
│   ├── threads.md        # 伏笔追踪
│   ├── decisions.md      # 讨论决议
│   ├── chapter-digests.md # 章节事实摘要
│   └── project-style-ref.md # 项目风格参考
├── chapters/             # 定稿章节
└── drafts/               # 草稿/试写
```

### 第四步：讨论设定

在创作之前，与 AI 讨论角色设定、世界观、大纲等细节。讨论中确认的内容可以通过以下方式归档：

- 说「记下来」或「归档」→ AI 会将决定写入对应的 memory 文件
- AI 也会在会话结束前提醒你是否有未归档的讨论决定

### 第五步：开始创作

- 正式章节：说「写下一章」或 `/write`
- 试写场景：说「写一段试试」或 `/draft`

## 完整命令列表

| 命令 | 自然语言触发 | 说明 |
|------|-------------|------|
| `/new-style` | 「新建文风」「分析文风」 | 从样本文本预处理文风指南 |
| `/update-style` | 「更新文风」「补充样本」 | 增量更新文风指南（补充新样本） |
| `/new-project` | 「新建项目」「开始新小说」 | 创建项目目录和模板文件 |
| `/write` | 「写下一章」「继续写」 | 正式章节创作 |
| `/draft` | 「写一段试试」「预览第X章」 | 试写/沙盒模式 |
| `/accept` | 「定稿」「这章可以了」 | 章节验收：验证一致性 + 更新记忆 |
| `/import` | 「导入章节」「导入我写的」 | 导入已有章节到项目记忆系统 |
| `/add-rule` | 「以后别这样写」「这个保持」 | 记录创作规则 |
| `/verify` | 「有没有矛盾」「验证一致性」 | 独立的一致性检查 |
| `/status` | 「进度」「当前状态」 | 查看项目状态 |

不使用命令也可以 —— AI 会根据对话内容自动判断意图并触发相应工作流。

## 核心概念

### 文风系统

系统将大量样本文本预处理为结构化的文风指南（`style-guide.md`），涵盖 9 个通用维度：

1. 叙事视角 2. 句式特征 3. 用词特征 4. 对白风格 5. 描写手法 6. 叙事节奏 7. 情感表达 8. 段落结构 9. 特殊手法

中文项目额外分析 7 个维度：文白比例、四字结构、量词习惯、语气词模式、标点风格、对仗排比、典故引用。

每个维度的结论都必须附带原文引用作为证据。

### 四级规则系统

规则按从通用到具体分为四级，冲突时更具体的优先：

```
global-rules.md                → 所有项目、所有文风
  └── profiles/{lang}-rules.md → 该语言下所有项目
      └── style-rules.md      → 该文风下所有项目
          └── project-rules.md → 仅本项目
```

每条规则包含：方向（坚持/避免）、严重程度（严重/重要/偏好）、来源、示例。

规则在使用过程中渐进积累 —— 你审稿时发现问题或亮点，随时可以记录为规则。

### 防吃书机制

| 阶段 | 措施 |
|------|------|
| 写前 | 加载章节事实摘要 + 角色当前状态 + 伏笔追踪 |
| 写中 | 子代理 prompt 明确要求不得与已有事实矛盾 |
| 写后 | 验证子代理提取事实主张并交叉比对，生成矛盾报告 |

### 草稿/试写系统

两种草稿类型：

- **场景速写**（scene-sketch）：独立场景片段，不在章节序列中
- **预览章节**（preview-chapter）：跳写未来某章，记录前提假设

草稿可以丢弃、保留为参考、或晋升为正式章节。

### 上下文窗口管理

通过以下策略在有限的上下文窗口中平衡参考材料和创作空间：

- **分层摘要压缩**：最近 1 章全文、近 5 章完整摘要、6-15 章压缩摘要、更早的事实已吸收进 memory
- **子代理隔离**：每个子代理拥有独立的上下文窗口，实际可用上下文倍增
- **降级路径**：不支持子代理的平台自动减少加载量

## 生成的工作区结构

```
novel-workspace/
├── .cursorrules              # Cursor 平台适配器
├── CLAUDE.md                 # Claude Code 平台适配器
├── system-prompt.md          # 通用平台适配指南
├── global-rules.md           # L1 全局通用规则
├── registry.yaml             # 工作流/子代理注册表（供 setup/sync 使用）
│
├── profiles/                 # 语言配置与语言特化规则
│   ├── zh-CN.md              #   中文创作配置（扩展维度 + token 预算）
│   └── zh-CN-rules.md        #   L1 中文特化创作规则（预置 40+ 条 AI 写作通病）
│
├── workflows/                # 工作流定义（平台无关）
│   ├── preprocess-style.md   #   文风预处理流程
│   ├── update-style.md       #   文风增量更新流程
│   ├── write-chapter.md      #   正式章节创作流程
│   ├── write-draft.md        #   草稿/试写流程
│   ├── accept-chapter.md     #   章节验收流程
│   ├── import-chapters.md    #   章节导入流程
│   ├── review-rules.md       #   规则记录流程
│   ├── verify.md             #   一致性验证流程
│   ├── archive-decision.md   #   决策归档流程
│   └── project-setup.md      #   项目创建流程
│
├── templates/                # 文件模板（创建项目时使用）
│   ├── project.yaml
│   ├── project-rules.md
│   ├── style-rules.md
│   ├── draft-header.md
│   └── memory/
│       ├── characters.md
│       ├── world.md
│       ├── outline.md
│       ├── threads.md
│       ├── decisions.md
│       ├── chapter-digests.md
│       └── project-style-ref.md
│
├── styles/                   # 文风库（用户创建）
│   └── {style-name}/
│       ├── raw-samples/      #   原始样本文件
│       ├── style-guide.md    #   预处理后的文风指南
│       ├── style-rules.md    #   L2 文风级规则
│       └── excerpts/         #   分类摘录
│
└── projects/                 # 项目库（用户创建）
    └── {project-name}/
        ├── project.yaml
        ├── project-rules.md  #   L3 项目级规则
        ├── memory/           #   项目记忆
        ├── chapters/         #   定稿章节
        └── drafts/           #   草稿区
```

## CLI 工具

### 安装与使用

通过 `bunx` 或 `bun create` 直接运行，无需全局安装：

| 命令 | 说明 |
|------|------|
| `bun create ai-novel-workspace my-novel` | 创建新工作区 |
| `bunx create-ai-novel-workspace` | 交互式创建新工作区 |
| `bunx create-ai-novel-workspace setup` | 为已有工作区生成适配文件 |
| `bunx create-ai-novel-workspace sync` | 重新生成适配文件（清理后重建） |
| `bunx create-ai-novel-workspace sync --clean` | 仅清理已生成文件 |

通用选项：`--platform cursor|claude-code|all`、`--dry-run`、`-y`（跳过确认）。

> 内容文件（工作流、模板、规则）在运行时从 GitHub 拉取，更新内容无需发布新版 CLI。

### 适配文件说明

CLI 工具会自动生成以下平台适配文件：

| 类型 | Cursor 路径 | Claude Code 路径 |
|------|-------------|-----------------|
| Skills | `.cursor/skills/novel-*/SKILL.md` | `.claude/skills/novel-*/SKILL.md` |
| Agents | `.cursor/agents/novel-*.md` | `.claude/agents/novel-*.md` |
| Commands | — | `.claude/commands/novel-*.md` |

Skills 是轻量包装器，指向 `workflows/*.md` 中的完整工作流定义。AI 会根据用户意图自动触发对应 skill。

Agents 是子代理系统提示，定义了专项任务（写作、校验、归档、风格分析）的角色和约束。

## 典型工作流程

```
1. bun create ai-novel-workspace my-novel    创建工作区
2. /new-style      准备样本 → 预处理文风 → 审阅确认 → 锁定
3. /new-project    选文风 → 选语言 → 选大纲模式 → 初始化
4. 讨论设定         角色、世界观、大纲 → 归档到 memory/
4a. /import        （可选）导入已有章节 → 提取摘要 → 构建记忆
5. /write          讨论方向 → AI 写章节 → 审阅修改 → 满意
6. /accept         验证一致性 → 提取摘要 → 更新记忆 → 归档
7. /add-rule       发现问题/亮点 → 分类 → 记录规则
7a. /update-style  （可选）补充新样本 → 增量分析 → 合并更新 → 锁定
8. 重复 5-7         持续创作，规则和记忆不断积累
```

## 常见问题

**Q：必须用 Cursor 或 Claude Code 吗？**

不必。系统的核心是纯 Markdown 文件和文件夹约定，与平台无关。`.cursorrules` 和 `CLAUDE.md` 只是薄适配层。任何能读写文件的 AI 平台都可以使用，参见 `system-prompt.md` 中的配置指南。

**Q：对 AI 模型有要求吗？**

建议使用上下文窗口 >= 128k 的模型以获得最佳体验。系统不限定具体模型，用户自行选择。

**Q：样本文本需要多少？**

建议 3-5 篇不同篇章的样本，总计 5 万字以上。样本越多、越多样，文风分析越准确。样本只需来自同一作者或同一风格，不要求是同一部作品。

**Q：可以同时管理多个项目吗？**

可以。`styles/` 和 `projects/` 下可以有任意多个子目录。不同项目可以共享同一个文风，也可以各自使用不同文风。

**Q：已有的小说章节可以导入吗？**

可以。将已有章节放入 `projects/{name}/chapters/` 下（命名为 `ch01.md`、`ch02.md` 等），然后使用 `/import` 命令。AI 会逐章提取事实摘要、角色状态、伏笔等信息并写入 memory 文件。支持冷启动（从空项目导入）和项目中导入（已有部分章节后补充导入）两种模式。

**Q：文风锁定后还能补充样本吗？**

可以。将新样本放入 `styles/{name}/raw-samples/` 下，然后使用 `/update-style` 命令。AI 会增量分析新样本，与现有文风指南逐维度对比，合并新发现并更新摘录，全程由你审阅确认。

**Q：中文写作有特殊优化吗？**

有。当 `project.yaml` 中设置 `language: zh-CN` 时，系统会：
- 加载 `profiles/zh-CN-rules.md`（预置 40+ 条中文 AI 写作通病及应对）
- 加载 `profiles/zh-CN.md`（额外 7 个中文文风分析维度 + token 预算调整）

**Q：更新了内容（工作流/模板）需要重新发布 CLI 吗？**

不需要。内容文件在运行时从 GitHub 拉取，push 到 git 即生效。只有 CLI 引擎本身的代码变更才需要发布新 npm 版本。
