# Project Setup Workflow

> 本工作流用于 `project-setup` 技能，在主对话中执行，无需子代理。

---

## Prerequisites（前置条件）

- [ ] `novel-workspace` 根目录已存在
- [ ] `novel-workspace/styles/` 目录已存在
- [ ] `novel-workspace/profiles/` 目录已存在

若任一条件不满足，先引导用户完成工作区初始化。

---

## Step-by-Step Process（分步流程）

### Step 1: Ask project name（获取项目名称）

- [ ] 向用户询问一个简短、适合文件系统的项目名称
- [ ] **校验规则**：
  - 不得包含空格
  - 不得包含特殊字符（建议使用连字符 `-`）
  - 项目名在 `projects/` 下必须唯一（见 Validation rules）
- [ ] 若校验失败，提示用户修改并重新输入

---

### Step 2: Select style（选择文风）

- [ ] 列出 `styles/` 目录下所有可用的文风（子目录名）
- [ ] 用户从中选择一项
- [ ] **若 `styles/` 为空或不存在任何文风**：告知用户需先执行 `/new-style` 创建文风
- [ ] **校验**：所选文风必须包含 `style-guide.md`，否则提示用户先运行 `/new-style`

---

### Step 3: Select language（选择语言）

- [ ] 列出 `profiles/` 目录下所有可用的语言配置（文件名，不含扩展名）
- [ ] 用户从中选择一项
- [ ] **默认值**：若用户未选择，使用 `zh-CN`
- [ ] **校验**：所选语言配置必须在 `profiles/` 中存在

---

### Step 4: Ask outline mode（询问大纲模式）

- [ ] 向用户说明三种模式并让其选择：

| 模式 | 说明 | 对 outline.md 的影响 |
|------|------|----------------------|
| **详细大纲** (detailed) | 按章节规划，用户后续填写细节 | 使用完整三幕+章节规划模板 |
| **连载/滚动** (serialized) | 松散框架，逐章即兴发挥 | 仅到「幕」或「阶段」，近期规划滚动推进 |
| **无大纲** (none) | 不设大纲，直接开写 | 使用最简模板或占位结构 |

- [ ] 根据选择决定 `memory/outline.md` 的初始模板内容

---

### Step 5: Create directory structure（创建目录结构）

在 `projects/{project-name}/` 下创建以下结构：

```
projects/{project-name}/
├── project.yaml
├── project-rules.md
├── memory/
│   ├── characters.md
│   ├── world.md
│   ├── outline.md
│   ├── threads.md
│   ├── decisions.md
│   ├── chapter-digests.md
│   └── project-style-ref.md
├── chapters/
└── drafts/
```

- [ ] 创建 `projects/{project-name}/` 根目录
- [ ] 创建 `memory/`、`chapters/`、`drafts/` 子目录

---

### Step 6: Initialize files from templates（从模板初始化文件）

- [ ] **project.yaml**：从 `templates/project.yaml` 复制，并填入：
  - `style`: 用户选择的文风
  - `language`: 用户选择的语言
  - `title`: 项目名称（可先用项目名，或询问用户）
  - `status`: `in-progress`
  - `created`: 当天日期 `YYYY-MM-DD`

- [ ] **project-rules.md**：从 `templates/project-rules.md` 复制

- [ ] **memory/*.md**：从 `templates/memory/` 复制所有文件
  - `characters.md`
  - `world.md`
  - `outline.md`（根据 Step 4 的大纲模式选择或调整模板）
  - `threads.md`
  - `decisions.md`
  - `chapter-digests.md`
  - `project-style-ref.md`

---

### Step 7: Confirmation and next steps（确认与后续建议）

- [ ] 展示已创建的目录结构
- [ ] 建议用户可选的下一步：

| 建议 | 说明 |
|------|------|
| 开始讨论角色设定 | 通过对话完善 `characters.md`，对话结论可归档到 `decisions.md` |
| 开始讨论世界观 | 通过对话完善 `world.md`，对话结论可归档到 `decisions.md` |
| 开始讨论大纲 | 通过对话完善 `outline.md`，对话结论可归档到 `decisions.md` |
| 直接开始写 | 执行 `/write` 工作流 |

---

## Template File Locations（模板文件路径）

所有路径相对于 `novel-workspace` 根目录：

| 文件 | 模板路径 |
|------|----------|
| 项目配置 | `templates/project.yaml` |
| 项目规则 | `templates/project-rules.md` |
| 角色 | `templates/memory/characters.md` |
| 世界观 | `templates/memory/world.md` |
| 大纲 | `templates/memory/outline.md` |
| 线索 | `templates/memory/threads.md` |
| 决策记录 | `templates/memory/decisions.md` |
| 章节摘要 | `templates/memory/chapter-digests.md` |
| 文风参考 | `templates/memory/project-style-ref.md` |

---

## Validation Rules（校验规则）

| 校验项 | 规则 | 失败时处理 |
|--------|------|------------|
| 项目名唯一性 | `projects/{project-name}/` 不得已存在 | 提示项目名已占用，请换名 |
| 文风有效性 | 所选文风目录下必须存在 `style-guide.md` | 提示用户先运行 `/new-style` 创建完整文风 |
| 语言配置存在 | 所选语言必须在 `profiles/` 中有对应文件 | 提示所选语言不存在，请重新选择 |
| 项目名格式 | 无空格、无特殊字符，建议用连字符 | 提示格式不符，给出正确示例 |

---

## Autonomous Execution Notes（自主执行说明）

- 本工作流可在主对话中由 AI 自主执行，无需调用子代理
- 每步需等待用户输入（项目名、选择项）后再继续
- 校验失败时，给出明确提示并回到对应步骤重新获取输入
- 创建完成后，主动询问用户希望从哪一步开始（角色/世界观/大纲/直接写）
