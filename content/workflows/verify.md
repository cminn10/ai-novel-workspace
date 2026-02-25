# Verify Workflow

一致性校验工作流 — 适用于 `verify-orchestrator` 技能

---

## Prerequisites

**前置条件**

- [ ] 至少存在一章内容（至少有一个章节文件）
- [ ] `chapter-digests.md` 已有对应条目（需有可交叉参照的章节摘要）

---

## Step-by-Step Process

### Step 1: Confirm verification scope

**步骤 1：确认校验范围**（在主对话中进行）

- [ ] 确定要校验的章节：
  - **选项 A**：仅最新章节
  - **选项 B**：指定章节（单章或多章）
  - **选项 C**：全部章节
- [ ] 确定校验类型：
  - **选项 A**：仅事实一致性（facts only）
  - **选项 B**：仅规则合规（rules only）
  - **选项 C**：两者皆验（both）
- [ ] 向用户展示选项并取得选择

---

### Step 2: Assemble verifier subagent prompt

**步骤 2：组装校验子代理提示**

- [ ] 载入目标章节内容（`{{TARGET_CHAPTERS}}`）
- [ ] 载入 `chapter-digests.md`（全部条目）
- [ ] 载入 `characters.md`（完整内容，含当前状态）
- [ ] 载入 `threads.md`
- [ ] 载入合并规则（四个层级：global → profiles/{lang}-rules → style → project）
- [ ] 若为规则校验：标注所有 **Critical** 与 **Important** 规则

---

### Step 3: Dispatch verifier subagent

**步骤 3：派发校验子代理**

- [ ] 使用下方 Subagent 模板建立并派发 verifier 子代理
- [ ] 传入已组装的上下文与参数

---

### Step 4: Present results

**步骤 4：呈现结果**（在主对话中）

- [ ] 产出结构化报告，包含以下区块：
  - **Factual contradictions**（事实矛盾，若有）：何者与何者矛盾、严重程度、两处文本证据
  - **Rule violations**（规则违反，若有）：违反哪条规则、文本位置、严重程度
  - **Unresolved threads**（未解决线索）：埋设已久、尚无收束迹象的线索
  - **Summary**：整体一致性评分/评估
- [ ] 由用户决定是否修正、以及修正范围

---

## Subagent: Verifier Prompt Template

**子代理：verifier 提示模板**

```
## Role / 角色

你是一位严谨的连载小说一致性校验员。你的任务是系统性地检查章节内容与已有记录的一致性。

## Context / 上下文

### 目标章节正文
{{TARGET_CHAPTERS}}

### 既有章节摘要 (chapter-digests.md)
{{CHAPTER_DIGESTS}}

### 角色当前状态 (characters.md)
{{CHARACTERS}}

### 伏笔追踪 (threads.md)
{{THREADS}}

### 合并后的规则（四级：global → profiles/{lang}-rules → style → project）
{{MERGED_RULES}}

## Task / 任务

1. 从目标章节中提取所有事实性主张（谁、什么、何时、何地、如何）
2. 将每条主张与 chapter-digests 条目交叉比对
3. 将角色行动/认知与 characters.md 当前状态交叉比对
4. 检查 threads.md 中是否有应被提及但未被提及的条目
5. 逐条检查所有 Critical 规则（必须报告每条规则的通过/不通过状态）
6. 扫描 Important 规则的潜在违反

## Output Format / 输出格式

使用结构化报告，每条发现标注置信度：
- 确定 (confirmed)：明确的矛盾或违反
- 疑似 (suspected)：可能存在问题，需审查
- 需人工判断 (requires human judgment)：有歧义，需作者决定

### 事实矛盾列表
| 序号 | 矛盾描述 | 严重程度 (高/中/低) | 证据（新章节 vs 既有记录） | 置信度 |
|------|----------|---------------------|---------------------------|--------|

### 规则违反列表
| 序号 | 违反的规则 | 规则类型 (Critical/Important) | 文本位置 | 置信度 |
|------|------------|------------------------------|----------|--------|

### 未解决线索提醒
- 长期未回收的伏笔列表及建议

### 总结
- 矛盾数量：X
- 规则违反数量：Y
- 整体一致性评估
- 是否建议通过：是/否（及理由）
```

---

## Execution Paths

### Preferred path（首选路径）

**使用子代理**

- 使用 verifier 子代理执行完整校验
- 可处理多章、全量 digests、全部规则
- 产出结构化报告与置信度等级

### Degraded path（降级路径）

**无子代理时**

- 在主对话中执行校验
- 缩小范围：
  - 仅校验最新一章
  - 仅对照最近 5 篇 chapter-digests 条目
  - 仅检查 Critical 规则
- 产出简化版报告

---

## Common Contradiction Patterns

**常见矛盾模式**（需特别检查）

| 模式 | 说明 |
|------|------|
| **角色位置不一致** | 同一时间点角色出现在不可能同时存在的两处 |
| **角色知识泄漏** | 角色知道其不应知晓的信息（吃书） |
| **时间线矛盾** | 事件顺序、日期、时长与前文不符 |
| **外貌描述变更** | 角色或场景的物理描述与先前不一致 |
| **物品/持有权追踪错误** | 物品去向、归属与前文矛盾 |
| **天气/环境连续性** | 同一场景内天气或环境描述前后不符 |

---

## Autonomous Execution Checklist

**自主执行检查清单**

1. [ ] 确认前置条件满足
2. [ ] 执行 Step 1，取得用户范围选择（或使用预设：最新章 + both）
3. [ ] 执行 Step 2，组装完整 prompt
4. [ ] 若有子代理能力：执行 Step 3（Preferred path）
5. [ ] 若无子代理能力：执行 Degraded path
6. [ ] 执行 Step 4，呈现报告并等待用户决策
