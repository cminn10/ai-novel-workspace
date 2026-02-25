# Preprocess Style Workflow

> AI 小说写作系统的风格预处理工作流。本文档定义从原始样本分析到风格指南与摘录产出的完整流程。执行本工作流的 AI 应能独立完成全部步骤，无需额外上下文。

---

## Prerequisites

在开始本工作流之前，必须满足以下前置条件：

- **raw-samples/** 目录已就绪：包含至少 3–5 个 `.txt` 文件，每个文件为同一作者或同一风格的原始小说样本（建议每篇 2000–10000 字）。
- **语言配置已加载**：已加载目标语言的 profile（如 `profiles/zh-CN.md`），以确定分析维度集合（9 个通用维度 + 语言特定扩展维度）。

目录结构示例：

```
novel-workspace/
├── profiles/
│   └── zh-CN.md
├── styles/
│   └── {style-name}/
│       └── raw-samples/
│           ├── sample-01.txt
│           ├── sample-02.txt
│           └── sample-03.txt
└── workflows/
    └── preprocess-style.md
```

---

## Step-by-Step Process

### Step 1: Load Language Profile and Determine Dimensions

- [ ] 读取语言 profile 文件（如 `profiles/zh-CN.md`）。
- [ ] 确认通用维度（9 个）已启用。
- [ ] 确认语言扩展维度已启用（如中文 7 个扩展维度）。
- [ ] 输出维度清单：zh-CN 共 16 个维度（1–9 通用，10–16 中文扩展）。
- [ ] 将维度清单写入工作区，供后续步骤引用。

**输出**：维度列表（16 个维度名称与编号）。

---

### Step 2: Per-Dimension Analysis with Subagent

- [ ] 为每个维度启动 **style-analyzer** 子代理（可并行）。
- [ ] 将 `raw-samples/` 下所有 `.txt` 的完整内容传入子代理。
- [ ] 每个子代理仅分析**一个**维度。
- [ ] 子代理必须引用至少 **2 段**原始原文作为证据。
- [ ] 子代理输出符合固定模板的结构化分析。
- [ ] 收集所有维度的分析结果，在工作区中暂存（可存为临时文件或保持在内存中）。

**输出**：16 个维度的结构化分析结果。

---

### Step 3: Excerpt Extraction and Categorization

- [ ] 基于 Step 2 的分析结果，从 raw-samples 中提取代表性段落。
- [ ] 按以下类别分类并写入对应文件（均位于 `styles/{style-name}/excerpts/` 下）：
  - `excerpts/narration.md` — 叙述性段落
  - `excerpts/dialogue.md` — 对白段落
  - `excerpts/description.md` — 描写段落
  - `excerpts/psychology.md` — 心理描写段落
  - `excerpts/action.md` — 动作/场面段落
  - `excerpts/four-char.md` — 四字结构典型例句（中文扩展）
  - `excerpts/classical.md` — 文言/半文言例句（中文扩展）
- [ ] 每个摘录需标注来源文件与大致位置（如 `sample-01.txt, ~line 120`）。
- [ ] 每个类别至少 3–5 条摘录。

**输出**：`styles/{style-name}/excerpts/` 目录下 7 个分类文件。

---

### Step 4: Assembly of style-guide.md

- [ ] 将 Step 2 的 16 个维度分析整合为统一风格指南。
- [ ] 按维度编号顺序组织内容。
- [ ] 每个维度包含：维度名称、分析结论、关键特征、禁忌项、示例引用。
- [ ] 在文末添加「摘录索引」，指向 `excerpts/` 中各文件。
- [ ] 写入 `styles/{style-name}/style-guide.md`。

**输出**：`styles/{style-name}/style-guide.md`。

---

### Step 5: User Review and Refinement

- [ ] 将 `style-guide.md` 与 `excerpts/` 呈现给用户。
- [ ] 收集用户反馈：不准确处、遗漏特征、过度概括等。
- [ ] 根据反馈修订 Step 2 中受影响的维度分析。
- [ ] 必要时补充或替换摘录。
- [ ] 重新执行 Step 4，更新 `style-guide.md`。
- [ ] 重复本步骤直至用户确认。

**输出**：修订后的 `style-guide.md` 与 `excerpts/`。

---

### Step 6: Validation Writing

- [ ] AI 根据 `style-guide.md` 撰写一段 300–500 字的测试段落。
- [ ] 测试段落需覆盖：叙述、对白、描写、心理、动作等至少 3 类。
- [ ] 用户将 AI 产出与 raw-samples 原文进行对比。
- [ ] 记录差异点：语气、句式、用词、节奏等。
- [ ] 若差异明显，回到 Step 5 或 Step 2 进行针对性修正。
- [ ] 若用户认可相似度，进入 Step 7。

**输出**：验证段落文本及用户对比结论。

---

### Step 7: Finalize and Lock

- [ ] 将最终版 `style-guide.md` 标记为已锁定（在文件头部添加 `status: locked` 或等效标记）。
- [ ] 确认 `excerpts/` 目录完整。
- [ ] 创建空的 `style-rules.md`（从 `templates/style-rules.md` 复制）。
- [ ] 通知用户工作流已完成。

**输出**：锁定的 `style-guide.md`、完整的 `excerpts/`、空的 `style-rules.md`。

---

## Subagent: style-analyzer

当存在子代理能力时，使用 **style-analyzer** 子代理执行单维度分析。每个子代理调用使用以下模板：

### 输入

- **raw_content**：`raw-samples/` 下所有 `.txt` 文件的拼接内容。
- **dimension_id**：当前分析的维度编号（1–16）。
- **dimension_name**：维度名称（如「叙事视角」「文白比例」）。

### 提示模板（Prompt Template）

```
你是一个风格分析子代理（style-analyzer）。你的任务是对给定小说样本进行**单一维度**的风格分析。

## 输入
- 维度编号：{dimension_id}
- 维度名称：{dimension_name}
- 原始样本全文：
---
{raw_content}
---

## 要求
1. 仅分析上述**一个**维度，不要涉及其他维度。
2. 每个结论必须引用至少 **2 段**原始原文作为证据，格式为：
   > 「引用原文」
   > — 来源：sample-XX.txt
3. 输出必须严格遵循下方「输出模板」的结构。
4. 若样本中该维度证据不足，明确标注「证据不足」，并说明需要补充的样本类型。

## 输出模板

### 维度：{dimension_name}

#### 核心特征
- [特征 1]：说明。证据：[引用 1][引用 2]
- [特征 2]：说明。证据：[引用 1][引用 2]
- …

#### 典型表现
[描述该维度在样本中的典型表现模式]

#### 禁忌/避免
[列出应避免的写法]

#### 引用原文
1. 「…」 — sample-XX.txt
2. 「…」 — sample-XX.txt
…
```

### 输出

- 结构化 Markdown 分析结果。
- 必须包含至少 2 条带来源的原文引用。

### 并行化

- 可为每个维度启动独立子代理，共 16 个并行任务。
- 主流程等待全部完成后合并结果。

---

## Multi-Pass Quality Methodology

为确保分析稳定可靠，采用多轮验证：

### 轮次

1. **第一轮**：对每个维度执行一次 style-analyzer 分析。
2. **第二轮**：对结论模糊或引用不足的维度再执行 1–2 次分析。
3. **第三轮**：若同一维度出现矛盾结论，进行第三轮，以多数一致结论为准。

### 一致性规则

- **保留**：多轮分析中重复出现的结论。
- **丢弃**：仅出现一次且与其他轮次矛盾的结论。
- **强制引用**：最终结论中，每个特征必须对应至少 2 段原文引用；不足则标注「待补充样本」。

### 执行流程

```
FOR each dimension in dimensions:
  results = []
  FOR pass in 1..3:
    analysis = run_style_analyzer(dimension, raw_content)
    results.append(analysis)
  merged = merge_consistent_conclusions(results)
  enforce_minimum_citations(merged, min_citations=2)
  store merged result for assembly
```

---

## Preferred Path (with Subagent)

当系统支持子代理时，采用以下路径：

1. **Step 1**：主流程加载语言 profile，确定 16 个维度。
2. **Step 2**：主流程并行启动 16 个 style-analyzer 子代理，每个分析一个维度。
3. **Step 2 质量**：对每个维度执行 2–3 轮分析，合并一致结论，强制引用。
4. **Step 3–7**：主流程顺序执行摘录提取、风格指南组装、用户审阅、验证写作、锁定。

**优势**：并行分析、单维度专注、可复现、易扩展。

---

## Degraded Path (without Subagent)

当无子代理能力时，全部工作在主对话中完成：

1. **Step 1**：主流程加载语言 profile，确定 16 个维度。
2. **Step 2**：主流程**顺序**分析每个维度，每次仅处理一个维度，使用与 style-analyzer 相同的提示逻辑。
3. **Step 2 质量**：对每个维度可进行 2 轮分析（主对话中分两次调用），合并结论。
4. **Step 3–7**：与 Preferred Path 相同。

**注意**：主对话需显式管理「当前维度」状态，避免在一次回复中混合多个维度，以保证分析质量。

---

## Universal Dimensions (1–9)

| 编号 | 英文名 | 中文名 | 说明 |
|------|--------|--------|------|
| 1 | Narrative perspective | 叙事视角 | 第一/二/三人称，视角切换，叙述者距离 |
| 2 | Sentence patterns | 句式特征 | 长短句比例，句式结构，断句习惯 |
| 3 | Vocabulary | 用词特征 | 词汇层级，口语/书面语，专业术语，重复用词 |
| 4 | Dialogue style | 对白风格 | 对话形式，引号使用，说话人标识，语气 |
| 5 | Description techniques | 描写手法 | 感官描写，比喻，白描，细描等 |
| 6 | Narrative pacing | 叙事节奏 | 快慢切换，时间跳跃，场景密度 |
| 7 | Emotional expression | 情感表达 | 直接/间接抒情，情绪词汇，克制与张扬 |
| 8 | Paragraph structure | 段落结构 | 段落长度，换行习惯，空行使用 |
| 9 | Special techniques | 特殊手法 | 伏笔、闪回、蒙太奇、意识流等 |

---

## Chinese Extended Dimensions (10–16)

| 编号 | 英文名 | 中文名 | 说明 |
|------|--------|--------|------|
| 10 | Classical-vernacular spectrum | 文白比例 | 文言与白话的混合程度，半文半白风格 |
| 11 | Four-character structures | 四字结构 | 成语、四字短语的使用频率与方式 |
| 12 | Measure word habits | 量词习惯 | 量词选择（个/只/条/枚等），方言量词 |
| 13 | Modal particle patterns | 语气词模式 | 啊、呢、吧、嘛、哩等使用习惯 |
| 14 | Punctuation style | 标点风格 | 省略号、破折号、顿号使用，标点密度 |
| 15 | Parallelism and antithesis | 对仗/排比 | 对偶、排比、骈文式句式的运用 |
| 16 | Allusion and quotation | 典故引用 | 古诗文、成语、俗语的引用方式 |

---

## Excerpts Categorization

摘录按以下类别输出到 `excerpts/` 目录：

| 文件名 | 类别 | 说明 |
|--------|------|------|
| `narration.md` | 叙述 | 纯叙述性段落，推进情节或交代背景 |
| `dialogue.md` | 对白 | 人物对话及对话前后简短叙述 |
| `description.md` | 描写 | 环境、外貌、场景等描写 |
| `psychology.md` | 心理 | 内心独白、心理活动描写 |
| `action.md` | 动作 | 动作场面、打斗、肢体描写 |
| `four-char.md` | 四字结构 | 四字成语/短语的典型例句（中文） |
| `classical.md` | 文言/半文言 | 文言色彩较重的例句（中文） |

每个文件格式示例：

```markdown
## 类别：叙述

### 摘录 1
> 原文内容……
> — sample-01.txt, ~line 45

### 摘录 2
> 原文内容……
> — sample-02.txt, ~line 120
```

---

## Execution Checklist (Summary)

执行本工作流时，可按此清单自检：

- [ ] Prerequisites：raw-samples 已就绪，语言 profile 已加载
- [ ] Step 1：维度清单已确定（16 个）
- [ ] Step 2：16 个维度分析已完成，每维度至少 2 条引用
- [ ] Step 2 质量：多轮分析已执行，矛盾已解决
- [ ] Step 3：7 个摘录文件已生成
- [ ] Step 4：style-guide.md 已组装
- [ ] Step 5：用户审阅已通过
- [ ] Step 6：验证段落已撰写，用户对比已通过
- [ ] Step 7：style-guide 已锁定，style-rules.md 已创建

---

*文档版本：1.0 | 适用于 AI 小说写作系统风格预处理*
