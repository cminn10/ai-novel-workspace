# Novel Writing System

这是一个 AI 辅助小说创作工作区。所有操作通过 workflows/ 下的工作流文档执行。

## 项目结构

```
novel-workspace/
├── profiles/          # 语言配置
├── workflows/         # 工作流定义（平台无关）
├── styles/            # 文风库（raw-samples + style-guide + excerpts + style-rules）
├── projects/          # 项目库（memory + chapters + drafts + project-rules）
├── templates/         # 文件模板
└── global-rules.md    # L1 全局通用规则
```

## 核心原则

1. **确认制写入**：所有 memory/ 文件的写入必须经用户确认，AI 不得自作主张修改档案
2. **权威等级**：chapters/（定稿）> memory/（确认设定）> drafts/reference（仅参考）> drafts/draft（未审阅）
3. **规则优先级**：project-rules > style-rules > profiles/{lang}-rules > global-rules（更具体的优先）
4. **严重规则是硬约束**：标记为 [严重] 的规则在创作中必须逐条自查，不可违反

## 工作流执行规范

执行任何工作流前，先读取对应的 `workflows/*.md` 文件，严格按步骤执行，不可跳步。
每个工作流文档包含完整的步骤清单、需加载的文件列表、子代理提示模板和输出格式要求。

**子代理路径规范**：派发任何子代理时，必须在提示中明确告知当前项目的**完整路径**（如 `projects/playground/`）。工作流中出现的所有相对路径（`drafts/`、`chapters/`、`memory/` 等）均相对于项目目录，子代理不得自行猜测。

## 意图路由

根据用户意图，调用对应的工作流（无论用户是否使用 Skill 名称）：

| 用户意图信号 | 工作流文件 |
|---|---|
| 想创建/分析新文风、"新建文风"、"分析文风" | → workflows/preprocess-style.md |
| 想更新文风、"补充样本"、"更新文风"、"加了新样本" | → workflows/update-style.md |
| 想新建项目、"新建项目"、"开始新小说" | → workflows/project-setup.md |
| 想写新章节、"继续写"、"写下一章"、"开始创作" | → workflows/write-chapter.md |
| 想试写场景、"写一段试试"、"预览第X章" | → workflows/write-draft.md |
| 章节写完了、"定稿"、"这章可以了" | → workflows/accept-chapter.md |
| 想导入已有章节、"导入章节"、"导入我写的" | → workflows/import-chapters.md |
| 指出问题或亮点、"以后别这样写"、"这个保持" | → workflows/review-rules.md |
| 想检查一致性、"有没有矛盾"、"验证" | → workflows/verify.md |
| 确认了某个设定/决定、"记下来"、"归档" | → workflows/archive-decision.md |

如果无法判断用户意图属于以上哪种，正常对话即可，不需要强制触发工作流。

## Agent Skills

本工作区的所有工作流已封装为 Agent Skills（位于 `.agent/skills/`），
Antigravity 会根据用户意图自动匹配并加载对应 Skill，无需手动指定。

| Skill | 说明 |
|---|---|
| novel-new-style | 创建/预处理文风 |
| novel-update-style | 增量更新文风（补充新样本） |
| novel-new-project | 新建创作项目 |
| novel-write | 正式章节创作 |
| novel-draft | 试写/试阅（沙盒模式） |
| novel-accept | 章节验收定稿 |
| novel-import | 导入已有章节 |
| novel-add-rule | 记录创作规则 |
| novel-verify | 一致性验证 |
| novel-archive | 决策归档 |

## /status 查询

当用户询问进度时，直接读取并展示以下信息（无需加载工作流文件）：

先确定当前项目目录（`projects/{project-name}/`），如有多个项目则询问用户：

1. 读取 `projects/{project}/project.yaml` → 展示项目名、使用的 style、语言、状态
2. 统计 `projects/{project}/chapters/` 下的文件数 → 已完成章节数
3. 读取 `projects/{project}/memory/outline.md` → 当前进度（在哪一幕/阶段）、下一章状态
4. 读取 `projects/{project}/memory/threads.md` → 统计未解决伏笔数量
5. 汇总各级 rules 文件 → 统计规则条目数（严重/重要/偏好）

## 会话结束提醒

在会话即将结束时（用户表示要离开、长时间无回复前），检查本次对话中是否有未归档的讨论决定，
如有则按 `workflows/archive-decision.md` 中的"会话结束审查协议"执行。
