# create-ai-novel-workspace — CLI 工具项目

这是一个 CLI 工具项目，用于脚手架化 AI 辅助小说创作工作区。

## 项目结构

```
ai-novel-workspace/
├── content/           # 内容模板（工作流、模板、规则），通过 giget 在运行时从 GitHub 拉取
│   ├── registry.yaml  # 工作流/子代理元数据注册表
│   ├── workflows/     # 工作流定义（平台无关）
│   ├── templates/     # 项目文件模板
│   ├── profiles/      # 语言配置
│   └── rules/         # 平台适配规则文件
├── src/               # CLI 源码（TypeScript）
│   ├── index.ts       # 入口 + 参数解析
│   ├── types.ts       # 共享类型定义
│   ├── content.ts     # giget 下载 + registry 解析
│   ├── utils.ts       # 文件 I/O 工具
│   ├── commands/      # init / setup / sync 命令
│   └── generators/    # 平台适配文件生成器（skills / agents / commands / workspace）
├── dist/              # 编译输出（git ignored）
├── package.json       # npm 包：create-ai-novel-workspace
└── tsconfig.json
```

## 架构要点

1. **内容与 CLI 解耦**：`content/` 是内容的 source of truth，不会打包进 npm。CLI 在运行时通过 giget 从 GitHub 拉取最新内容。
2. **npm 包极小**：`package.json` 的 `files` 只包含 `dist/`，不含 content。
3. **registry.yaml 驱动**：所有工作流和子代理的元数据定义在 `content/registry.yaml`，CLI 是通用引擎。
4. **`bun create` 兼容**：包名为 `create-ai-novel-workspace`，支持 `bun create ai-novel-workspace my-novel`。

## 开发流程

- 编辑 content/ 下的内容 → 直接 push 到 git，用户下次运行自动获取最新版
- 编辑 src/ 下的 CLI 代码 → `bun run build` → 发布新 npm 版本
- 本地测试：`bun run dist/index.js init --dir test-workspace --dry-run`
