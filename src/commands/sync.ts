import * as p from "@clack/prompts";
import pc from "picocolors";
import { resolveRegistry } from "../content.js";
import { isNovelWorkspace, cleanGenerated } from "../utils.js";
import {
  ALL_PLATFORMS,
  PLATFORM_CONFIG,
  parsePlatforms,
  detectPlatforms,
  buildPlatformSelectOptions,
  generateAdapters,
} from "../platforms.js";
import type { Platform } from "../types.js";

export interface SyncOptions {
  platform?: string;
  clean?: boolean;
  dryRun?: boolean;
  yes?: boolean;
}

export async function runSync(options: SyncOptions): Promise<void> {
  const cwd = process.cwd();

  p.intro(pc.bgCyan(pc.black(" AI 小说创作工作区 — 同步适配文件 ")));

  if (!isNovelWorkspace(cwd)) {
    p.cancel(
      `当前目录不是小说工作区（未找到 workflows/ 目录）。\n  请在工作区根目录下运行。`,
    );
    process.exit(1);
  }

  let cleanPlatforms: Platform[];
  if (options.platform) {
    cleanPlatforms = parsePlatforms(options.platform);
  } else {
    cleanPlatforms = detectPlatforms(cwd);
    if (cleanPlatforms.length === 0) {
      cleanPlatforms = [...ALL_PLATFORMS];
    }
  }

  if (options.clean) {
    const s = p.spinner();
    s.start("清理已生成的适配文件");
    const { removed } = cleanGenerated(
      cwd,
      cleanPlatforms,
      PLATFORM_CONFIG,
      options.dryRun ?? false,
    );
    s.stop(`${removed.length} 个文件已清理`);

    if (options.dryRun) {
      p.log.warn("预览模式 — 未实际删除文件");
    }
    p.outro("清理完成");
    return;
  }

  const s = p.spinner();
  s.start("加载 registry");
  const { registry, cleanup } = await resolveRegistry(cwd);
  s.stop("registry 已加载");

  try {
    let platforms: Platform[];
    if (options.platform) {
      platforms = parsePlatforms(options.platform);
    } else {
      const detected = detectPlatforms(cwd);
      if (detected.length > 0) {
        p.log.info(
          `检测到已有适配: ${detected.map((p) => PLATFORM_CONFIG[p].label).join(", ")}`,
        );
        platforms = detected;
      } else if (options.yes) {
        platforms = [...ALL_PLATFORMS];
      } else {
        const platResult = await p.select({
          message: "选择目标平台",
          options: buildPlatformSelectOptions({ includeAll: true }),
        });
        if (p.isCancel(platResult)) {
          p.cancel("已取消");
          process.exit(0);
        }
        platforms = parsePlatforms(platResult as string);
      }
    }

    s.start("清理旧适配文件");
    const { removed } = cleanGenerated(
      cwd,
      platforms,
      PLATFORM_CONFIG,
      options.dryRun ?? false,
    );
    s.stop(`${removed.length} 个旧文件已清理`);

    s.start("重新生成适配文件");
    const created = generateAdapters(
      cwd,
      platforms,
      registry,
      options.dryRun ?? false,
    );
    s.stop(`${created.length} 个适配文件已生成`);

    if (options.dryRun) {
      p.log.warn("预览模式 — 未实际修改文件");
    }

    p.note(
      [
        `已清理: ${removed.length} 个文件`,
        `已生成: ${created.length} 个文件`,
      ].join("\n"),
      "同步摘要",
    );

    p.outro("同步完成");
  } finally {
    cleanup?.();
  }
}
