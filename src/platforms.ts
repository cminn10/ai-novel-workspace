import { existsSync } from "fs";
import { join } from "path";
import type { Platform, PlatformConfig, Registry } from "./types.js";
import { generateSkills } from "./generators/skills.js";
import { generateAgents } from "./generators/agents.js";
import { generateCommands } from "./generators/commands.js";

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  cursor: {
    label: "Cursor",
    detectDir: ".cursor",
    skillsDir: ".cursor/skills",
    agentsDir: ".cursor/agents",
    commandsDir: null,
    ruleFile: { src: "rules/cursorrules", dest: ".cursorrules" },
  },
  "claude-code": {
    label: "Claude Code",
    detectDir: ".claude",
    skillsDir: ".claude/skills",
    agentsDir: ".claude/agents",
    commandsDir: ".claude/commands",
    ruleFile: { src: "rules/CLAUDE.md", dest: "CLAUDE.md" },
  },
  antigravity: {
    label: "Google Antigravity",
    detectDir: ".agent",
    skillsDir: ".agent/skills",
    agentsDir: ".agent/agents",
    commandsDir: null,
    ruleFile: { src: "rules/antigravity.md", dest: ".agent/settings/rules.md" },
  },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_CONFIG) as Platform[];

export function parsePlatforms(value: string): Platform[] {
  if (value === "all") return [...ALL_PLATFORMS];
  if (value === "generic") return [];
  if (value in PLATFORM_CONFIG) return [value as Platform];
  return [...ALL_PLATFORMS];
}

export function detectPlatforms(cwd: string): Platform[] {
  return ALL_PLATFORMS.filter((p) =>
    existsSync(join(cwd, PLATFORM_CONFIG[p].detectDir)),
  );
}

export function buildPlatformSelectOptions(opts?: {
  includeAll?: boolean;
  includeGeneric?: boolean;
  exclude?: Platform[];
}): Array<{ value: string; label: string }> {
  const excluded = new Set(opts?.exclude ?? []);
  const options: Array<{ value: string; label: string }> = ALL_PLATFORMS
    .filter((p) => !excluded.has(p))
    .map((p) => ({ value: p, label: PLATFORM_CONFIG[p].label }));

  if (opts?.includeAll && options.length > 1) {
    options.push({ value: "all", label: "全部" });
  }
  if (opts?.includeGeneric) {
    options.push({ value: "generic", label: "仅核心文件（不生成适配器）" });
  }
  return options;
}

export function generateAdapters(
  workspaceDir: string,
  platforms: Platform[],
  registry: Registry,
  dryRun: boolean,
): string[] {
  const created: string[] = [];

  for (const plat of platforms) {
    const config = PLATFORM_CONFIG[plat];
    created.push(
      ...generateSkills(workspaceDir, plat, registry.workflows, dryRun),
    );
    created.push(
      ...generateAgents(workspaceDir, plat, registry.agents, dryRun),
    );
    if (config.commandsDir) {
      created.push(
        ...generateCommands(workspaceDir, plat, registry.workflows, dryRun),
      );
    }
  }

  return created;
}
