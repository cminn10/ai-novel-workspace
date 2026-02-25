# Import Chapters Workflow

> AI 小说写作系统的章节导入工作流。本文档定义将已有章节（用户手写或从外部导入）纳入项目记忆系统的完整流程。与 `/accept` 工作流的核心区别：**导入时以章节内容为权威来源**，目标是从章节中构建/更新记忆，而非用记忆去验证章节。

---

## Prerequisites / 前置条件

在开始导入章节前，必须满足以下条件：

- [ ] **project.yaml** 存在且有效
- [ ] **memory/** 目录下文件已存在（可为空模板）：
  - `chapter-digests.md`
  - `characters.md`
  - `threads.md`
  - `outline.md`
  - `world.md`
  - `decisions.md`（如存在）
- [ ] **待导入章节文件**已放入 `chapters/` 目录下，遵循命名规范 `ch{NN}.md`（如 `ch01.md`、`ch02.md`）
- [ ] **合并后的四级规则**（global + profiles/{lang}-rules + style + project）已可加载

---

## Import Mode / 导入模式

本工作流根据项目记忆状态自动选择导入模式：

| 模式 | 条件 | 行为 |
|------|------|------|
| **冷启动导入** (Cold Import) | `chapter-digests.md` 为空或仅含模板内容 | 仅执行 acceptor 提取，不执行验证（无已有记录可比对） |
| **项目中导入** (Mid-project Import) | `chapter-digests.md` 已有条目 | acceptor 提取 + verifier 以**咨询模式**运行（标记不一致但不阻断） |

**权威等级**（导入场景下）：

```
章节内容（导入来源）> memory/（待更新）
```

当章节内容与现有 memory 冲突时，默认建议以章节内容为准更新 memory。用户可逐项决定。

---

## Step-by-Step Process / 分步流程

### Step 1: Identify Chapters to Import / 识别待导入章节（主对话中执行）

- [ ] 扫描 `chapters/` 目录下所有 `ch*.md` 文件
- [ ] 读取 `chapter-digests.md`，识别已有摘要的章节编号
- [ ] 计算差集：在 `chapters/` 中存在但在 `chapter-digests.md` 中无对应摘要的章节 = 待导入章节
- [ ] 若用户手动指定了文件列表，以用户指定为准
- [ ] 向用户展示待导入章节清单，确认处理顺序（默认按章节编号升序）
- [ ] 用户确认后，进入 Step 2

**输出**：有序的待导入章节文件列表。

---

### Step 2: Determine Import Mode / 确定导入模式

- [ ] 检查 `chapter-digests.md` 内容：
  - 若为空或仅含模板占位内容 → **冷启动导入**
  - 若已有至少一个章节摘要条目 → **项目中导入**
- [ ] 向用户说明当前模式及其含义
- [ ] 加载所有 memory 文件（可能为空模板）

**输出**：导入模式（cold / mid-project）、当前 memory 状态。

---

### Step 3: Load Context / 加载上下文

- [ ] 读取 `project.yaml`，确定文风与语言
- [ ] 按优先级读取并合并规则文件：
  1. `global-rules.md`
  2. `profiles/{lang}-rules.md`（如存在）
  3. `styles/{style}/style-rules.md`
  4. `projects/{project}/project-rules.md`
- [ ] 读取所有 memory 文件：`characters.md`、`world.md`、`outline.md`、`threads.md`、`decisions.md`、`chapter-digests.md`、`project-style-ref.md`

**输出**：合并后的规则、当前 memory 文件内容。

---

### Step 4: Sequential Per-Chapter Processing / 逐章顺序处理

**重要**：必须按章节编号顺序处理。每章处理完毕并写入 memory 后，后续章节的处理基于更新后的 memory 状态。

对每个待导入章节，执行以下子步骤：

#### Step 4a: Dispatch Acceptor / 派发接纳子代理

- [ ] 派发 **acceptor** 子代理，传入：
  - 当前章节完整正文
  - 所有 memory 文件（含已导入章节的更新）
  - `project-style-ref.md`（如存在）
- [ ] acceptor 输出：
  1. `chapter-digests.md` 新条目（按 Digest Format Template）
  2. `characters.md` 角色状态更新提案
  3. `threads.md` 伏笔更新提案
  4. `outline.md` 完成日志条目
  5. `world.md` 新设定（如有）
  6. `decisions.md` 新条目（如有）

#### Step 4b: Dispatch Verifier in Advisory Mode / 派发验证子代理（咨询模式）

**仅在项目中导入模式下执行。冷启动导入跳过本步。**

- [ ] 派发 **verifier** 子代理（咨询模式），传入：
  - 当前章节正文
  - `chapter-digests.md`（含本次导入已处理的章节）
  - `characters.md`（当前状态）
  - `threads.md`
  - 合并后的规则
- [ ] verifier 以咨询模式输出：
  - 不一致列表（信息性，非阻断）
  - 每条不一致附带建议：「以章节为准更新记忆」（默认）或「需人工审查」
  - 规则合规性检查（参考性）

#### Step 4c: Present Results / 展示结果（主对话中执行）

- [ ] 展示 acceptor 提取的结构化信息（按目标文件分组）
- [ ] （项目中导入时）展示 verifier 的不一致提醒，标注建议处理方式
- [ ] 用户逐项确认：接受、修改或拒绝各项更新

#### Step 4d: Execute Updates / 执行更新

- [ ] 按确认清单写入各文件（顺序：`chapter-digests.md` → `characters.md` → `threads.md` → `outline.md` → `world.md` → `decisions.md`）
- [ ] 每次写入附带时间戳
- [ ] 刷新内存中的 memory 状态，供下一章使用

#### Step 4e: Next Chapter / 处理下一章

- [ ] 若还有待导入章节，回到 Step 4a 处理下一章
- [ ] 若所有章节已处理，进入 Step 5

---

### Step 5: Post-Import Summary / 导入完成摘要（主对话中执行）

- [ ] 展示导入汇总报告：

```
## 导入完成报告

### 基本信息
- 导入模式：冷启动导入 / 项目中导入
- 导入章节数：X 章（第N章 – 第M章）

### Memory 更新统计
- chapter-digests.md：新增 X 条摘要
- characters.md：新增/更新 X 个角色状态
- threads.md：新增 X 条伏笔，回收 X 条
- outline.md：新增 X 条完成日志
- world.md：新增 X 条设定
- decisions.md：新增 X 条记录

### 未解决事项（如有）
- [不一致描述]：用户选择暂不处理，标记为待后续关注
```

- [ ] 提示用户可通过 `/verify` 对导入后的全部章节进行一致性复查
- [ ] 提示用户可继续执行 `/write` 开始新章节创作

---

## Subagent Prompt Templates / 子代理提示模板

### Acceptor Subagent Prompt Template

**复用 `accept-chapter.md` 中的 acceptor 提示模板**，无需修改。acceptor 的任务（提取摘要、角色状态、伏笔、大纲条目、新设定、新决策）在导入场景下完全适用。

完整模板参见 `workflows/accept-chapter.md`「Acceptor Subagent Prompt Template」部分。

### Verifier Subagent Prompt Template (Advisory Mode)

```
## Role / 角色

你是一位严谨的连载小说一致性审查员，当前运行在**咨询模式**。你的任务是检查导入章节与既有记录的一致性，但产出的报告仅供参考，不阻断导入流程。

**关键区别**：在导入场景中，章节内容是权威来源。当章节与既有记忆冲突时，默认建议以章节为准更新记忆。

## Context / 上下文

### 导入章节正文
{{CHAPTER_TEXT}}

### 既有章节摘要 (chapter-digests.md)
{{CHAPTER_DIGESTS}}

### 角色当前状态 (characters.md 中的 📍当前状态 部分)
{{CHARACTERS}}

### 伏笔追踪 (threads.md)
{{THREADS}}

### 合并后的规则（四级：global + profiles/{lang}-rules + style + project）
{{MERGED_RULES}}

## Task / 任务

1. 从导入章节中提取所有事实性主张
2. 与既有 chapter-digests 和 characters 交叉比对，识别不一致
3. 检查规则合规性（参考性，不阻断）
4. 输出咨询报告

## Output Format / 输出格式

## 咨询报告（Advisory Report）

### 不一致列表
| 序号 | 描述 | 严重程度 (高/中/低) | 证据（章节 vs 既有记录） | 建议处理 |
|------|------|---------------------|--------------------------|----------|
（建议处理列：「以章节为准更新记忆」或「需人工审查」。默认为「以章节为准更新记忆」。）

### 规则合规参考
| 序号 | 相关规则 | 规则类型 (Critical/Important) | 备注 |
|------|----------|------------------------------|------|
（仅列出可能需注意的项，不作为阻断依据。）

### 总结
- 不一致数量：X
- 规则参考项数量：Y
- 整体评估：[无明显冲突 / 存在需注意的不一致]
```

---

## Preferred Path vs Degraded Path / 优选路径与降级路径

### Preferred Path（有子代理，并行派发）

- 每章处理时同时派发 **acceptor** 与 **verifier**（咨询模式）两个子代理（项目中导入时）
- 冷启动导入时仅派发 **acceptor**
- 两个子代理并行执行，缩短单章处理耗时
- 主对话仅负责协调、展示结果、收集用户确认

### Degraded Path（无子代理，主对话中顺序执行）

当无法使用子代理时，在主对话中顺序执行，需做以下降级：

- **acceptor 任务**：
  - 主对话中直接执行提取，可降低粒度
  - digest：保留核心事件与角色状态，可略化对话要点
  - 角色状态：仅更新明确变化的字段
  - threads：仅标注明显的新伏笔与回收

- **verifier 任务**（项目中导入时）：
  - 仅比对最近 3–5 章的 digest
  - 仅检查 Critical 规则
  - 产出简化版咨询报告

- **流程**：每章先执行 acceptor 任务 → 再执行 verifier 任务（如需）→ 展示结果 → 用户确认 → 写入 → 下一章

---

## Digest Format Template / 摘要格式模板

**复用 `accept-chapter.md` 中的 Digest Format Template**，格式完全相同：

```markdown
## 第X章：[章节标题]

### 事件序列
1. [事件描述]（时间：[具体或相对]，地点：[?]，天气/环境：[?]）

### 场景/环境事实
- [新建立的场景细节]

### 角色状态（章末）
- [角色名]：[位置]，[身体状况]，[持有物]，[情绪状态]

### 新建立的事实
- [首次出现的设定/信息/关系变化]

### 对话要点
- [关键对话内容]（说话人 → 听话人，含义/后果）
```

完整说明参见 `workflows/accept-chapter.md`「Digest Format Template」与「Character State Update Format」部分。

---

## Edge Cases / 边界情况

### 章节编号不连续

若待导入章节编号存在间隔（如有 ch01、ch03 但无 ch02）：
- 向用户确认是否为有意为之
- 若用户确认，按实际编号顺序处理，在 digest 中标注间隔

### 章节内容格式不统一

用户手写章节可能不含标准格式（无 frontmatter 等）：
- acceptor 应能处理纯文本正文
- 无需要求导入章节遵循特定格式

### 大量章节批量导入

当待导入章节数 > 5 时：
- 向用户确认是否采用「快速确认」模式：每章仅展示摘要级别的提取结果，而非完整的逐项确认
- 用户可选择在全部导入完成后统一审阅（通过 `/verify` 工作流）

### 与 `/accept` 工作流的区分

若用户对一个 AI 刚写完的章节说「导入」，应引导用户使用 `/accept`：
- 「这一章是刚刚创作的，建议使用 `/accept` 进行验收（以记忆为准验证一致性）。`/import` 适用于导入外部已有章节（以章节为准更新记忆）。」

---

## Execution Notes / 执行说明

本工作流设计为可由 AI 自主执行。执行时：

1. 严格按步骤顺序进行
2. 每步完成后勾选对应复选框
3. Step 1、Step 4c 中必须等待用户输入后再继续
4. Step 4 的顺序处理不可打乱——每章的 memory 写入是下一章处理的前提
5. 所有写入操作必须附带时间戳
6. 若用户拒绝某项 proposed update，该更新不写入，但记录在对话中

---

*文档版本：1.0 | 适用于 AI 小说写作系统章节导入*
