import * as p from "@clack/prompts";
import pc from "picocolors";
import { resolveRegistry } from "../content.js";
import { isNovelWorkspace } from "../utils.js";
import { generateSkills } from "../generators/skills.js";
import { generateAgents } from "../generators/agents.js";
import { generateCommands } from "../generators/commands.js";
import type { Platform } from "../types.js";

export interface SetupOptions {
  platform?: string;
  dryRun?: boolean;
  yes?: boolean;
}

export async function runSetup(options: SetupOptions): Promise<void> {
  const cwd = process.cwd();

  p.intro(pc.bgCyan(pc.black(" AI 小说创作工作区 — 平台适配 ")));

  if (!isNovelWorkspace(cwd)) {
    p.cancel(
      `当前目录不是小说工作区（未找到 workflows/ 目录）。\n  请在工作区根目录下运行，或使用 ${pc.cyan("create-ai-novel-workspace")} 创建新工作区。`,
    );
    process.exit(1);
  }

  const s = p.spinner();
  s.start("加载 registry");
  const { registry, cleanup } = await resolveRegistry(cwd);
  s.stop("registry 已加载");

  try {
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
        ],
      });
      if (p.isCancel(platResult)) {
        p.cancel("已取消");
        process.exit(0);
      }
      platforms = parsePlatforms(platResult as string);
    }

    s.start("生成适配文件");

    const created: string[] = [];
    for (const plat of platforms) {
      created.push(
        ...generateSkills(
          cwd,
          plat,
          registry.workflows,
          options.dryRun ?? false,
        ),
      );
      created.push(
        ...generateAgents(
          cwd,
          plat,
          registry.agents,
          options.dryRun ?? false,
        ),
      );
      if (plat === "claude-code") {
        created.push(
          ...generateCommands(
            cwd,
            registry.workflows,
            options.dryRun ?? false,
          ),
        );
      }
    }

    s.stop(`${created.length} 个适配文件已生成`);

    if (options.dryRun) {
      p.log.warn("预览模式 — 未实际写入文件");
    }

    p.note(
      [
        `平台: ${platforms.join(", ")}`,
        `Skills: ${registry.workflows.length} 个`,
        `Agents: ${registry.agents.length} 个`,
        platforms.includes("claude-code")
          ? `Commands: ${registry.workflows.length} 个`
          : "",
        "",
        pc.dim("重新生成: create-ai-novel-workspace sync"),
        pc.dim("清理: create-ai-novel-workspace sync --clean"),
      ]
        .filter(Boolean)
        .join("\n"),
      "摘要",
    );

    p.outro("适配完成");
  } finally {
    cleanup?.();
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
    default:
      return ["cursor", "claude-code"];
  }
}
