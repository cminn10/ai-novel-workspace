# Write Chapter Workflow

本文档定义 AI 小说写作系统中撰写正式章节的完整流程。供 `write-orchestrator` 技能及执行者自主执行。

---

## Prerequisites / 前置条件

在开始撰写章节前，必须满足以下条件：

- [ ] **project.yaml** 存在且有效
- [ ] **style-guide.md** 存在（位于当前风格目录下）
- [ ] **memory/** 目录下文件已填充：
  - `characters.md`
  - `world.md`
  - `outline.md`
  - `threads.md`
  - `decisions.md`
  - `chapter-digests.md`
  - `project-style-ref.md`（如存在）

---

## Step-by-Step Process / 分步流程

### Step 1: Load rules / 加载规则（主对话中执行）

- [ ] 读取 `project.yaml`，确定当前风格（style）和语言（lang）
- [ ] 按优先级顺序读取并合并规则文件：
  1. `global-rules.md`
  2. `profiles/{lang}-rules.md`（如存在）
  3. `styles/{style}/style-rules.md`
  4. `projects/{project}/project-rules.md`
- [ ] **醒目列出所有 [严重] (Critical) 规则**，供后续步骤引用

---

### Step 2: Load creation references / 加载创作参考（为子代理组装）

- [ ] 从风格目录读取 `style-guide.md`
- [ ] 从 `excerpts/` 中按场景类型选取相关摘录：
  - narration（叙述）
  - dialogue（对话）
  - description（描写）
  - 其他与本章相关的类型
- [ ] 读取 **所有** memory 文件：
  - `characters.md`
  - `world.md`
  - `outline.md`
  - `threads.md`
  - `decisions.md`
  - `chapter-digests.md`
  - `project-style-ref.md`
- [ ] 按层级压缩读取 `chapter-digests.md`：
  - **最近 5 章**：完整摘要
  - **第 6–15 章**：压缩摘要（仅关键事件）
  - **第 16 章及以后**：不加载（事实已吸收进 memory 文件）
- [ ] 读取上一章完整正文（来自 `chapters/`）

---

### Step 3: Confirm writing direction / 确认写作方向（主对话中执行）

- [ ] 展示 `outline.md` 当前进度与滚动计划
- [ ] 与用户讨论本章写作方向
- [ ] 在动笔前确认关键要点

---

### Step 4: Assemble writer subagent prompt / 组装写作子代理提示

- [ ] 包含所有已加载材料
- [ ] 包含讨论确定的写作方向
- [ ] 突出标注 [严重] 规则
- [ ] 加入对 [严重] 规则的自检说明
- [ ] **必须在提示中明确告知子代理当前项目的完整路径**（如 `projects/playground/`），所有文件读写操作均相对于该项目目录。子代理不得自行猜测项目路径

---

### Step 5: Dispatch writer subagent / 派发写作子代理

- [ ] 使用组装好的提示调用 writer 子代理
- [ ] 等待子代理返回章节草稿

---

### Step 6: Present draft for review / 提交草稿供审阅（主对话中执行）

- [ ] 展示章节正文
- [ ] 等待用户评价：
  - **满意** → 提示用户执行 `/accept` 工作流
  - **需修订** → 记录修订意见，重新派发 writer 或由用户手动编辑
  - **不满意** → 在补充指导后重写

---

## Subagent: Writer Prompt Template / 写作子代理提示模板

```
## Role / 角色

你是一位专业小说写手，严格遵循项目风格指南与规则，撰写与既有世界观、人物和情节一致的新章节。

## Reference Materials / 参考材料

### Style Guide
{{STYLE_GUIDE}}

### Merged Rules (Critical rules highlighted)
{{MERGED_RULES}}

### Memory Files
{{MEMORY_FILES}}

### Chapter Digests (hierarchical)
{{CHAPTER_DIGESTS}}

### Previous Chapter Full Text
{{PREVIOUS_CHAPTER}}

### Project Style Reference (if any)
{{PROJECT_STYLE_REF}}

### Writing Direction (from discussion)
{{WRITING_DIRECTION}}

## Critical Constraint

You MUST NOT contradict any facts in the provided digests and character states.
你不得与所提供的摘要和人物状态中的任何事实相矛盾。

## Task

根据上述材料与写作方向，撰写本章完整正文。

## Self-Check Before Output

完成写作后，你必须自检以下 [严重] 规则是否全部满足：
- [ ] （此处列出所有 Critical 规则项）

## Output Format

输出纯章节正文，不含元数据、标题行、章节编号或任何非正文内容。
```

---

## Preferred Path vs Degraded Path / 优选路径与降级路径

### Preferred Path（有子代理）

- 使用完整上下文
- 按 Step 2 的层级压缩加载 `chapter-digests.md`
- 加载 `excerpts/` 中相关摘录
- 加载全部规则与 memory 文件
- 派发 writer 子代理执行写作

### Degraded Path（无子代理，主对话中执行）

当无法使用子代理时，在主对话中执行写作，需做以下降级：

- **摘要深度**：仅加载最近 3 章的摘要（而非 5 章完整 + 10 章压缩）
- **摘录**：跳过 `excerpts/` 加载
- **规则**：仅加载并突出 [严重] 规则，其他规则可选
- **Memory**：仍加载 `characters.md`、`world.md`、`outline.md`、`threads.md`、`decisions.md`、`chapter-digests.md`（压缩版）、`project-style-ref.md`
- **上一章**：仍加载完整正文

---

## Post-Completion Actions / 完成后动作

- [ ] 提示用户：若对草稿满意，请执行 `/accept` 工作流以完成本章的正式接受与归档
- [ ] 若用户选择修订，在修订完成后再次提示执行 `/accept`

---

## Execution Notes / 执行说明

本工作流设计为可由 AI 自主执行。执行时：

1. 严格按步骤顺序进行
2. 每步完成后勾选对应复选框
3. 遇到缺失文件时，在继续前向用户报告并确认
4. 在 Step 3 与 Step 6 中，必须等待用户输入后再继续
