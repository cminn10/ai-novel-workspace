import { existsSync } from "fs";
import { resolve } from "path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { downloadContent, loadRegistry } from "../content.js";
import { scanProfiles } from "../utils.js";
import { scaffoldWorkspace } from "../generators/workspace.js";
import { generateSkills } from "../generators/skills.js";
import { generateAgents } from "../generators/agents.js";
import { generateCommands } from "../generators/commands.js";
import type { Platform } from "../types.js";

export interface InitOptions {
  dir?: string;
  platform?: string;
  yes?: boolean;
  dryRun?: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" AI 小说创作工作区 — 初始化 ")));

  let targetDir: string;
  if (options.dir) {
    targetDir = resolve(options.dir);
  } else if (options.yes) {
    targetDir = resolve("novel-workspace");
  } else {
    const dirResult = await p.text({
      message: "工作区目录名",
      placeholder: "novel-workspace",
      defaultValue: "novel-workspace",
    });
    if (p.isCancel(dirResult)) {
      p.cancel("已取消");
      process.exit(0);
    }
    targetDir = resolve(dirResult as string);
  }

  if (existsSync(targetDir) && !options.yes) {
    const overwrite = await p.confirm({
      message: `目录 ${pc.yellow(targetDir)} 已存在，是否覆盖？`,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("已取消");
      process.exit(0);
    }
  }

  let platforms: Platform[];
  if (options.platform) {
    platforms = parsePlatforms(options.platform);
  } else if (options.yes) {
    platforms = ["cursor", "claude-code"];
  } else {
    const platResult = await p.select({
      message: "选择目标平台",
      options: [
        { value: "cursor", label: "Cursor" },
        { value: "claude-code", label: "Claude Code" },
        { value: "all", label: "两者都要" },
        { value: "generic", label: "仅核心文件（不生成适配器）" },
      ],
    });
    if (p.isCancel(platResult)) {
      p.cancel("已取消");
      process.exit(0);
    }
    platforms = parsePlatforms(platResult as string);
  }

  const s = p.spinner();

  s.start("从 GitHub 获取最新内容");
  const { dir: contentDir, cleanup } = await downloadContent();
  s.stop("内容已下载");

  try {
    const availableLangs = scanProfiles(contentDir);

    let selectedLang: string;
    if (options.yes || availableLangs.length <= 1) {
      selectedLang = availableLangs[0] ?? "zh-CN";
    } else {
      const langResult = await p.select({
        message: "选择创作语言",
        options: availableLangs.map((l) => ({ value: l, label: l })),
      });
      if (p.isCancel(langResult)) {
        p.cancel("已取消");
        process.exit(0);
      }
      selectedLang = langResult as string;
    }

    s.start("创建工作区文件");
    const wsFiles = options.dryRun
      ? []
      : scaffoldWorkspace(targetDir, contentDir);
    s.stop(`${wsFiles.length} 个工作区文件已创建`);

    if (platforms.length > 0) {
      s.start("生成平台适配文件");
      const registry = loadRegistry(contentDir);
      const adapterFiles: string[] = [];

      for (const plat of platforms) {
        adapterFiles.push(
          ...generateSkills(
            targetDir,
            plat,
            registry.workflows,
            options.dryRun ?? false,
          ),
        );
        adapterFiles.push(
          ...generateAgents(
            targetDir,
            plat,
            registry.agents,
            options.dryRun ?? false,
          ),
        );
        if (plat === "claude-code") {
          adapterFiles.push(
            ...generateCommands(
              targetDir,
              registry.workflows,
              options.dryRun ?? false,
            ),
          );
        }
      }

      s.stop(`${adapterFiles.length} 个适配文件已生成`);
    }

    p.note(
      [
        `${pc.green("工作区已创建")}: ${targetDir}`,
        `语言: ${selectedLang}`,
        `平台: ${platforms.length > 0 ? platforms.join(", ") : "generic"}`,
        "",
        pc.dim("下一步："),
        `  1. 用 AI 工具打开 ${pc.cyan(targetDir)}`,
        `  2. 准备文风样本到 styles/{name}/raw-samples/`,
        `  3. 告诉 AI「分析文风」或使用 /new-style`,
      ].join("\n"),
      "完成",
    );

    p.outro("祝创作愉快！");
  } finally {
    cleanup();
  }
}

function parsePlatforms(value: string): Platform[] {
  switch (value) {
    case "cursor":
      return ["cursor"];
    case "claude-code":
      return ["claude-code"];
    case "all":
      return ["cursor", "claude-code"];
    case "generic":
      return [];
    default:
      return ["cursor", "claude-code"];
  }
}
