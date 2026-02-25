import { existsSync, mkdirSync, writeFileSync, readdirSync, rmSync } from "fs";
import { join, dirname, relative } from "path";
import pc from "picocolors";
import type { Platform, PlatformConfig } from "./types.js";

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, "utf-8");
}

export function isNovelWorkspace(dir: string): boolean {
  return existsSync(join(dir, "workflows"));
}

export function scanProfiles(dir: string): string[] {
  const profilesDir = join(dir, "profiles");
  if (!existsSync(profilesDir)) return [];

  return readdirSync(profilesDir)
    .filter((f) => f.endsWith(".md") && !f.includes("-rules"))
    .map((f) => f.replace(".md", ""));
}

export function cleanGenerated(
  workspaceDir: string,
  platforms: Platform[],
  platformConfig: Record<Platform, PlatformConfig>,
  dryRun: boolean,
): { removed: string[] } {
  const removed: string[] = [];

  const dirs: string[] = [];
  for (const plat of platforms) {
    const config = platformConfig[plat];
    dirs.push(join(workspaceDir, config.skillsDir));
    dirs.push(join(workspaceDir, config.agentsDir));
    if (config.commandsDir) {
      dirs.push(join(workspaceDir, config.commandsDir));
    }
  }

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      if (!entry.startsWith("novel-")) continue;
      const fullPath = join(dir, entry);
      const relPath = relative(workspaceDir, fullPath);
      if (dryRun) {
        console.log(`  ${pc.dim("[dry-run] rm")} ${relPath}`);
      } else {
        rmSync(fullPath, { recursive: true });
      }
      removed.push(relPath);
    }
  }

  return { removed };
}
