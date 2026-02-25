#!/usr/bin/env node

import { runInit, type InitOptions } from "./commands/init.js";
import { runSetup, type SetupOptions } from "./commands/setup.js";
import { runSync, type SyncOptions } from "./commands/sync.js";

const VERSION = "0.2.0";

function printHelp(): void {
  console.log(`
create-ai-novel-workspace v${VERSION}
AI 小说创作工作区初始化与平台适配工具

用法:
  create-ai-novel-workspace [command] [options]
  bun create ai-novel-workspace [dir]

命令:
  init      创建新的小说工作区（默认命令）
  setup     为已有工作区生成平台适配文件（支持增量添加）
  sync      重新生成适配文件（清理旧文件后重建）

通用选项:
  --platform <p>   cursor | claude-code | antigravity | all | generic
  --dry-run        预览模式（不写入文件）
  -y               跳过交互确认
  -h, --help       显示帮助
  -v, --version    显示版本号

init 专用选项:
  --dir <path>     指定工作区目录路径

sync 专用选项:
  --clean          仅清理已生成文件，不重新生成

示例:
  bun create ai-novel-workspace my-novel     交互式创建工作区
  bunx create-ai-novel-workspace             交互式创建工作区
  bunx create-ai-novel-workspace init --dir my-novel
  bunx create-ai-novel-workspace setup --platform cursor
  bunx create-ai-novel-workspace setup --platform antigravity
  bunx create-ai-novel-workspace sync
  bunx create-ai-novel-workspace sync --clean
`);
}

const KNOWN_COMMANDS = new Set(["init", "setup", "sync"]);

interface ParsedArgs {
  command: string;
  platform?: string;
  dir?: string;
  dryRun: boolean;
  yes: boolean;
  clean: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {
    command: "init",
    dryRun: false,
    yes: false,
    clean: false,
    help: false,
    version: false,
  };

  const positional: string[] = [];
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case "--platform":
        if (i + 1 >= argv.length || argv[i + 1].startsWith("-")) {
          console.error("错误: --platform 需要一个参数值");
          process.exit(1);
        }
        args.platform = argv[++i];
        break;
      case "--dir":
        if (i + 1 >= argv.length || argv[i + 1].startsWith("-")) {
          console.error("错误: --dir 需要一个参数值");
          process.exit(1);
        }
        args.dir = argv[++i];
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "-y":
      case "--yes":
        args.yes = true;
        break;
      case "--clean":
        args.clean = true;
        break;
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-v":
      case "--version":
        args.version = true;
        break;
      default:
        if (!arg.startsWith("-")) {
          positional.push(arg);
        }
        break;
    }
    i++;
  }

  if (positional.length > 0) {
    if (KNOWN_COMMANDS.has(positional[0])) {
      args.command = positional[0];
      if (positional.length > 1) {
        args.dir = positional[1];
      }
    } else {
      args.command = "init";
      args.dir = positional[0];
    }
  }

  return args;
}

process.on("SIGINT", () => {
  console.log("\n已中断。重新运行命令即可完成配置。");
  process.exit(130);
});

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    console.log(VERSION);
    return;
  }

  if (args.help) {
    printHelp();
    return;
  }

  switch (args.command) {
    case "init": {
      const opts: InitOptions = {
        dir: args.dir,
        platform: args.platform,
        yes: args.yes,
        dryRun: args.dryRun,
      };
      await runInit(opts);
      break;
    }
    case "setup": {
      const opts: SetupOptions = {
        platform: args.platform,
        dryRun: args.dryRun,
        yes: args.yes,
      };
      await runSetup(opts);
      break;
    }
    case "sync": {
      const opts: SyncOptions = {
        platform: args.platform,
        clean: args.clean,
        dryRun: args.dryRun,
        yes: args.yes,
      };
      await runSync(opts);
      break;
    }
    default:
      console.error(`未知命令: ${args.command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
