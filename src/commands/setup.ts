import * as p from "@clack/prompts";
import pc from "picocolors";
import { resolveRegistry } from "../content.js";
import { isNovelWorkspace } from "../utils.js";
import {
  ALL_PLATFORMS,
  PLATFORM_CONFIG,
  parsePlatforms,
  detectPlatforms,
  buildPlatformSelectOptions,
  generateAdapters,
} from "../platforms.js";
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
      platforms = [...ALL_PLATFORMS];
    } else {
      const existing = detectPlatforms(cwd);

      if (existing.length > 0) {
        p.log.info(
          `已检测到适配: ${existing.map((p) => PLATFORM_CONFIG[p].label).join(", ")}`,
        );
      }

      const unconfigured = ALL_PLATFORMS.filter(
        (p) => !existing.includes(p),
      );

      if (unconfigured.length === 0) {
        p.log.success("所有平台均已配置");
        p.log.info(
          `使用 ${pc.cyan("create-ai-novel-workspace sync")} 重新生成适配文件`,
        );
        p.outro("无需操作");
        return;
      }

      const selectOptions = buildPlatformSelectOptions({
        exclude: existing,
        includeAll: true,
      });

      if (selectOptions.length === 1) {
        platforms = [unconfigured[0]];
        p.log.info(
          `将为 ${pc.cyan(PLATFORM_CONFIG[unconfigured[0]].label)} 生成适配文件`,
        );
      } else {
        const platResult = await p.select({
          message: "选择要添加的平台",
          options: selectOptions,
        });
        if (p.isCancel(platResult)) {
          p.cancel("已取消");
          process.exit(0);
        }
        platforms = parsePlatforms(platResult as string);
      }
    }

    s.start("生成适配文件");
    const created = generateAdapters(
      cwd,
      platforms,
      registry,
      options.dryRun ?? false,
    );
    s.stop(`${created.length} 个适配文件已生成`);

    if (options.dryRun) {
      p.log.warn("预览模式 — 未实际写入文件");
    }

    const hasCommands = platforms.some(
      (pl) => PLATFORM_CONFIG[pl].commandsDir,
    );

    p.note(
      [
        `平台: ${platforms.map((pl) => PLATFORM_CONFIG[pl].label).join(", ")}`,
        `Skills: ${registry.workflows.length} 个`,
        `Agents: ${registry.agents.length} 个`,
        hasCommands ? `Commands: ${registry.workflows.length} 个` : "",
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
