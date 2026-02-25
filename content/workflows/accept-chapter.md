# Accept Chapter Workflow

本文档定义 AI 小说写作系统中章节验收/定稿的完整流程。供 `accept-orchestrator` 技能及执行者自主执行。

---

## Prerequisites / 前置条件

在开始验收章节前，必须满足以下条件：

- [ ] **chapters/** 目录下存在待验收的章节文件（用户已审阅并认可为最终版本）
- [ ] **memory/** 目录下文件已存在且可读：
  - `chapter-digests.md`
  - `characters.md`
  - `threads.md`
  - `outline.md`
  - `world.md`
  - `decisions.md`（如存在）
- [ ] **合并后的四级规则**（global + profiles/{lang}-rules + style + project）已可加载

---

## Step-by-Step Process / 分步流程

以下步骤由 `accept-orchestrator` 技能执行。

### Step 1: Confirm target chapter / 确认目标章节（主对话中执行）

- [ ] 识别待验收的章节文件（通常为 `chapters/ch{N}.md` 或用户指定的路径）
- [ ] 向用户展示章节标题与简要内容，确认此为最终版本
- [ ] 用户确认后，加载该章节完整正文，进入 Step 2

---

### Step 2: Dispatch two subagents in parallel / 并行派发两个子代理

**执行方式**：同时启动 verifier 与 acceptor 子代理，两者并行执行。

#### Subagent A: verifier / 验证子代理

**上下文**：
- 新章节正文
- `chapter-digests.md`（全部或最近 N 章，视项目规模而定）
- `characters.md`（当前状态部分）
- `threads.md`
- 合并后的四级规则（global + profiles/{lang}-rules + style + project）

**任务**：
1. 从新章节中提取所有事实性主张（人物位置、事件、对话、设定等）
2. 与既有 digest 数据库交叉比对，识别矛盾
3. 与角色当前状态交叉比对，识别吃书（角色知道不该知道的信息）
4. 检查规则合规性：**所有 [严重] (Critical) 规则**必须逐条检查；**[重要] (Important) 规则**进行扫描

**输出格式**：结构化报告

```
## 验证报告

### 矛盾列表
| 序号 | 矛盾描述 | 严重程度 (高/中/低) | 证据（新章节 vs 既有记录） | 置信度 (高/中/低) |
|------|----------|---------------------|---------------------------|-------------------|

### 规则违反列表
| 序号 | 违反的规则 | 规则类型 (Critical/Important) | 文本位置（段落/行/引用） | 置信度 |
|------|------------|------------------------------|-------------------------|--------|

### 总结
- 矛盾数量：X
- 规则违反数量：Y
- 是否建议通过：是/否（及理由）
```

#### Subagent B: acceptor / 接纳子代理

**上下文**：
- 新章节正文
- **所有** memory 文件（`chapter-digests.md`、`characters.md`、`threads.md`、`outline.md`、`world.md`、`decisions.md`）
- `project-style-ref.md`（如存在）

**任务**：

1. **提取章节摘要**：按标准格式（见下方 Digest Format Template）生成新 digest 条目
2. **提出角色状态更新**：针对每个出场角色，提出 `📍当前状态` 部分的更新内容
3. **提出 threads.md 更新**：新伏笔以 `[ ]` 格式，已回收伏笔以 `[x]` 格式
4. **提出 outline.md 完成日志条目**：摘要、偏差、新要素、伏笔、当前幕
5. **标记新设定**：若有应在 `world.md` 中新增的设定，列出
6. **标记决策**：若有应记录到 `decisions.md` 的讨论决议，列出

**输出格式**：按目标文件分块，清晰分隔

```
## 接纳报告

### 1. chapter-digests.md  proposed update
（完整的新 digest 条目，见 Digest Format Template）

### 2. characters.md proposed updates
#### [角色名]
（📍当前状态 各字段的 proposed 更新）

#### [角色名]
...

### 3. threads.md proposed updates
#### 未解决（新增）
- [ ] 伏笔描述（第X章埋设）

#### 已回收
- [x] 伏笔描述 → 第Y章揭示：回收方式说明

### 4. outline.md proposed completion log entry
（完整条目，见 Outline Completion Log Format）

### 5. world.md proposed additions (if any)
- 设定类别：具体内容

### 6. decisions.md proposed entries (if any)
- 决定标题：具体内容
```

---

### Step 3: Review verifier results / 审查验证结果（主对话中执行）

- [ ] 接收 verifier 子代理返回的结构化报告
- [ ] **若存在矛盾**：
  - 向用户展示矛盾列表（含严重程度与证据）
  - 询问用户：**修正章节** 还是 **更新既有记录**（以新章节为准）
  - 若用户选择修正章节：提示用户编辑后重新执行 `/accept`
  - 若用户选择更新记录：记录决策，在 Step 4 中由 acceptor 的更新覆盖
- [ ] **若存在规则违反**：
  - 向用户展示违反列表
  - 询问用户：**修正章节** 还是 **接受违反**（记录为已知例外）
  - 若用户选择修正：提示用户编辑后重新执行 `/accept`
  - 若用户选择接受：记录决策，继续
- [ ] **若无问题**：直接进入 Step 4

---

### Step 4: Review acceptor results / 审查接纳结果（主对话中执行）

- [ ] 接收 acceptor 子代理返回的 proposed updates
- [ ] 按目标文件分组向用户展示：
  - `chapter-digests.md`：新 digest 条目
  - `characters.md`：各角色状态更新
  - `threads.md`：新增/已回收伏笔
  - `outline.md`：完成日志条目
  - `world.md`：新设定（如有）
  - `decisions.md`：新决策（如有）
- [ ] **用户逐项确认**：每类更新单独确认，用户可接受、修改或拒绝
- [ ] 记录用户确认的更新清单，进入 Step 5

---

### Step 5: Execute confirmed updates / 执行已确认的更新

- [ ] 按确认清单，依次写入各文件
- [ ] **每次写入均附带时间戳**（在变更记录或条目中）
- [ ] 写入顺序建议：`chapter-digests.md` → `characters.md` → `threads.md` → `outline.md` → `world.md` → `decisions.md`
- [ ] 全部写入完成后，向用户确认完成
- [ ] 提示用户：本章已正式归档，可继续下一章写作

---

## Subagent Prompt Templates / 子代理提示模板

### Verifier Subagent Prompt Template

```
## Role / 角色

你是一位严谨的事实核查员，负责检查新章节与既有世界观、人物状态和规则的一致性。你的输出必须是结构化的、可操作的报告。

## Context / 上下文

### 新章节正文
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

1. **提取事实**：从新章节中系统提取所有事实性主张（事件、地点、时间、天气、人物位置、持有物、对话内容、角色所知信息等）
2. **交叉比对**：将每条主张与 chapter-digests 和 characters 中的既有记录比对，识别矛盾
3. **规则检查**：逐条检查所有 [严重] (Critical) 规则；扫描 [重要] (Important) 规则
4. **输出报告**：按指定格式输出结构化报告

## Output Format / 输出格式

严格按以下格式输出，使用 Markdown 表格：

## 验证报告

### 矛盾列表
| 序号 | 矛盾描述 | 严重程度 (高/中/低) | 证据（新章节 vs 既有记录） | 置信度 (高/中/低) |
|------|----------|---------------------|---------------------------|-------------------|
（若无矛盾，表格为空，或写"无"）

### 规则违反列表
| 序号 | 违反的规则 | 规则类型 (Critical/Important) | 文本位置（段落/行/引用） | 置信度 |
|------|------------|------------------------------|-------------------------|--------|
（若无违反，表格为空，或写"无"）

### 总结
- 矛盾数量：X
- 规则违反数量：Y
- 是否建议通过：是/否（及理由）
```

---

### Acceptor Subagent Prompt Template

```
## Role / 角色

你是一位小说项目档案员，负责从已完成的章节中提取结构化信息，并生成对 memory 文件的更新提案。你的输出必须按目标文件分块、清晰可执行。

## Context / 上下文

### 新章节正文
{{CHAPTER_TEXT}}

### 既有 memory 文件
{{CHAPTER_DIGESTS}}
{{CHARACTERS}}
{{THREADS}}
{{OUTLINE}}
{{WORLD}}
{{DECISIONS}}

### 项目风格参考 (如有)
{{PROJECT_STYLE_REF}}

## Task / 任务

完成以下五项任务，每项输出到对应区块：

1. **章节摘要**：按 Digest Format Template 提取本章 digest
2. **角色状态更新**：针对每个出场角色，提出 📍当前状态 的更新（见 Character State Update Format）
3. **threads.md 更新**：新伏笔用 `[ ]`，已回收用 `[x]`，格式见 threads.md 模板
4. **outline.md 完成日志**：按 Outline Completion Log Format 生成条目
5. **world.md 新增**：若有首次出现且应持久化的设定，列出
6. **decisions.md 新增**：若有应记录的创作决策，列出

## Output Format / 输出格式

严格按以下结构输出，每个区块标题后直接跟内容：

## 接纳报告

### 1. chapter-digests.md proposed update
（完整 digest 条目）

### 2. characters.md proposed updates
（按角色分块）

### 3. threads.md proposed updates
（未解决 / 已回收 分块）

### 4. outline.md proposed completion log entry
（完整条目）

### 5. world.md proposed additions (if any)
（列表或"无"）

### 6. decisions.md proposed entries (if any)
（列表或"无"）
```

---

## Preferred Path vs Degraded Path / 优选路径与降级路径

### Preferred Path（有子代理，并行派发）

- 同时派发 **verifier** 与 **acceptor** 两个子代理
- 两者并行执行，缩短总耗时
- verifier 使用完整 digest + 角色状态 + 规则
- acceptor 使用全部 memory 文件
- 主对话仅负责协调、展示结果、收集用户确认

### Degraded Path（无子代理，主对话中顺序执行）

当无法使用子代理时，在主对话中顺序执行，需做以下降级：

- **验证**：
  - 仅加载最近 3–5 章的 digest（而非全部）
  - 规则检查：仅逐条核对 [严重] 规则，[重要] 规则做快速扫描
  - 矛盾检查：重点核对角色位置、持有物、所知信息，其余做抽样检查
  - 输出简化版报告（可无表格，用列表代替）

- **接纳**：
  - 按相同任务顺序执行，但可降低提取粒度
  - digest：保留核心事件与角色状态，可略化对话要点
  - 角色状态：仅更新明确变化的字段
  - threads：仅标注明显的新伏笔与回收

- **流程**：先完成验证 → 用户确认 → 再完成接纳 → 用户逐项确认 → 执行写入

---

## Digest Format Template / 摘要格式模板

`chapter-digests.md` 中每章条目的标准结构：

```markdown
## 第X章：[章节标题]

### 事件序列
1. [事件描述]（时间：[具体或相对]，地点：[?]，天气/环境：[?]）
2. ...

### 场景/环境事实
- [新建立的场景细节]
- [可复用的环境设定]

### 角色状态（章末）
- [角色名]：[位置]，[身体状况]，[持有物]，[情绪状态]
- ...

### 新建立的事实
- [首次出现的设定/信息/关系变化]

### 对话要点
- [关键对话内容]（说话人 → 听话人，含义/后果）
- ...
```

**说明**：
- 事件序列按时间顺序排列
- 场景/环境事实：本章新确立的、后续可能引用的细节
- 角色状态：与 characters.md 的 📍当前状态 保持一致
- 新建立的事实：首次出现的设定，可能需同步到 world.md
- 对话要点：对情节或人物关系有影响的对话，非逐字记录

---

## Character State Update Format / 角色状态更新格式

`characters.md` 中每个角色的 `📍当前状态` 部分，验收时更新的字段：

| 字段 | 说明 | 更新原则 |
|------|------|----------|
| **位置** | 角色章末所在的地点/场景 | 以章节结尾时的位置为准 |
| **身体状况** | 受伤、生病、疲劳等 | 若有变化则更新，否则保持 |
| **持有物** | 手中/身上的重要物品 | 新增、丢失、获得均需记录 |
| **知道什么** | 角色目前知晓的信息 | 本章新获得的信息需追加 |
| **不知道什么** | 角色尚不知晓的信息 | 若本章揭示某信息给该角色，从"不知道"中移除 |

**格式示例**（proposed update 块）：

```markdown
#### 张三
- **位置**：城东茶楼二楼雅间
- **身体状况**：左臂轻伤（与上一章一致）
- **持有物**：玉佩（李四所赠）、碎银三两
- **知道什么**：李四的真实身份、王五已离城
- **不知道什么**：李四与王五的暗中联络
```

**变更记录**：每次更新后，在角色档案底部的「变更记录」中追加一行：
```
- [YYYY-MM-DD] 第X章验收：更新当前状态（位置、持有物、知道什么）
```

---

## Outline Completion Log Format / 大纲完成日志格式

`outline.md` 的「三、已完成章节」中，每章验收后追加的条目格式：

```markdown
### 第X章：[章节标题] ✅
- **内容摘要**：（1–3 句话概括本章核心事件）
- **偏差记录**：与大纲的偏离（如有，否则写"无"）
- **新建立要素**：（新角色、新地点、新设定等）
- **埋下伏笔**：（本章新埋的伏笔列表）
- **当前所处幕**：第一幕 / 第二幕 / 第三幕
- **章节文件**：chapters/chXX.md
- **验收时间**：YYYY-MM-DD
```

---

## Execution Notes / 执行说明

本工作流设计为可由 AI 自主执行。执行时：

1. 严格按步骤顺序进行
2. 每步完成后勾选对应复选框
3. Step 1、Step 3、Step 4 中必须等待用户输入后再继续
4. Step 2 的并行派发需在支持子代理的环境中执行；否则使用 Degraded Path
5. 所有写入操作必须附带时间戳
6. 若用户拒绝某项 proposed update，该更新不写入，但需在对话中记录用户决定（必要时可写入 decisions.md）
