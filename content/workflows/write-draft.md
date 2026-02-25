# Write Draft Workflow

草稿写作工作流：用于场景速写（scene sketch）和预览章节（preview chapter）的沙盒式写作流程。

---

## Prerequisites | 前置条件

在开始本工作流之前，必须满足以下条件：

- [ ] `project.yaml` 存在
- [ ] `style-guide.md` 存在

若任一条件不满足，应提示用户并中止工作流。

---

## Step-by-Step Process | 分步流程

以下步骤由 `draft-orchestrator` 技能执行。

### Step 1: Confirm Draft Type | 确认草稿类型

**执行位置**：主对话（main conversation）

- [ ] 向用户确认草稿类型：
  - **scene-sketch**：独立场景速写，与章节顺序无关。用户描述具体场景内容。
  - **preview-chapter**：在先行章节尚未完成时撰写的未来章节。用户需指定章节位置（如第 N 章）。

---

### Step 2: Load Context | 加载上下文

**加载策略**：比正式 `/write` 工作流更轻量。

- [ ] **始终加载**：
  - `style-guide.md`
  - 合并后的规则（merged rules）
  - `memory/` 目录下的文件（角色、世界观、大纲等）

- [ ] **scene-sketch 额外规则**：
  - 若存在 `project-style-ref.md`，则加载
  - **不加载** digests（摘要）

- [ ] **preview-chapter 额外规则**：
  - 完整加载 `outline.md`
  - 记录用户假设（用户假定在此章节之前已发生的情节）

---

### Step 3: Record Assumptions (preview-chapter only) | 记录假设（仅预览章节）

**执行位置**：主对话

- [ ] 询问用户：在此章节之前，他们假定已经发生了哪些情节？
- [ ] 将用户回答记录到草稿的 YAML frontmatter 中的 `assumptions:` 字段

---

### Step 4: Assemble Writer Subagent Prompt | 组装写作子代理提示

- [ ] 使用比正式章节写作更轻量的上下文（scene-sketch 不包含 digests）
- [ ] 包含：style-guide + 合并规则 + 相关 memory 内容
- [ ] **preview-chapter**：将 `assumptions` 作为显式上下文纳入提示

---

### Step 5: Dispatch Writer Subagent | 派发写作子代理

- [ ] 调用写作子代理，传入 Step 4 组装的提示
- [ ] 等待子代理返回草稿文本

---

### Step 6: Present Result and Handle Lifecycle | 展示结果并处理生命周期

**执行位置**：主对话

- [ ] 向用户展示草稿文本
- [ ] 用户做出选择，执行对应操作：

| 用户选择 | 操作 |
|---------|------|
| **Discard（丢弃）** | 将 `status` 标记为 `discarded`，或直接删除文件 |
| **Reference（参考）** | 将 `status` 标记为 `reference`，询问用户 `note:` 说明保留原因，保存至 `drafts/` 并写入完整 YAML 头部 |
| **Promote（晋升）** | 将文件移至 `chapters/`，触发完整 `/accept` 工作流 |

---

## Draft YAML Header Format | 草稿 YAML 头部格式

```yaml
---
type: scene-sketch | preview-chapter
status: draft | reference | promoted | discarded
relates_to: ""
created: YYYY-MM-DD
assumptions: []
note: ""
---
```

| 字段 | 说明 |
|------|------|
| `type` | `scene-sketch` 或 `preview-chapter` |
| `status` | `draft`（草稿）、`reference`（参考）、`promoted`（已晋升）、`discarded`（已丢弃） |
| `relates_to` | 关联的章节或场景标识，可为空 |
| `created` | 创建日期，格式 `YYYY-MM-DD` |
| `assumptions` | 仅 preview-chapter 使用，记录用户假定已发生的情节列表 |
| `note` | 用户说明（如保留为 reference 的原因） |

---

## Authority Hierarchy | 权威层级

**重要提醒**：事实的权威性按以下顺序递减：

```
chapters/ > memory/ > drafts/reference > drafts/draft
```

- `chapters/` 中的内容具有最高权威
- `memory/` 次之
- `drafts/reference` 再次
- `drafts/draft` 最低

**草稿中的事实不具有约束力**。当草稿与 `chapters/` 或 `memory/` 冲突时，以 `chapters/` 和 `memory/` 为准。

---

## Extracting Good Passages to project-style-ref.md | 提取优秀段落至 project-style-ref.md

当用户表示某草稿在风格上表现良好时：

- [ ] 识别草稿中的 exemplary passages（ exemplary 段落）
- [ ] 将段落提取到 `project-style-ref.md`
- [ ] 为每段添加：
  - **source attribution**：来源（文件名、草稿类型）
  - **note**：说明该段好在何处（如：对话节奏、氛围营造、视角运用等）

---

## Execution Paths | 执行路径

### Preferred Path | 首选路径（使用子代理）

- 使用 writer subagent 执行实际写作
- 上下文完整、输出质量更高
- 适用于有子代理能力的环境

### Degraded Path | 降级路径（无子代理）

- 在主对话中直接执行写作
- 上下文可能略简化，但仍需包含 style-guide、rules、memory
- 适用于子代理不可用时的回退方案

---

## File Naming Conventions | 文件命名规范

| 草稿类型 | 命名格式 | 示例 |
|---------|---------|------|
| scene-sketch | `drafts/scene-{descriptive-name}.md` | `drafts/scene-tavern-confrontation.md` |
| preview-chapter | `drafts/preview-ch{N}-{descriptive-name}.md` | `drafts/preview-ch12-final-battle.md` |

- `{descriptive-name}`：简短、描述性的英文标识，使用连字符分隔
- `{N}`：章节编号

---

## Autonomous Execution Checklist | 自主执行检查清单

执行本工作流时，按序确认：

1. [ ] 前置条件已满足
2. [ ] 草稿类型已确认
3. [ ] 上下文已按类型正确加载
4. [ ] （preview-chapter）假设已记录
5. [ ] 写作子代理提示已组装
6. [ ] 子代理已派发（或使用降级路径）
7. [ ] 结果已展示，用户选择已执行
8. [ ] 文件已按命名规范保存（若未丢弃）
9. [ ] YAML 头部已正确写入
