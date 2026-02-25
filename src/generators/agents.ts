import { join, relative } from "path";
import type { AgentEntry, Platform } from "../types.js";
import { writeFile } from "../utils.js";

function platformAgentDir(workspaceDir: string, platform: Platform): string {
  return platform === "cursor"
    ? join(workspaceDir, ".cursor", "agents")
    : join(workspaceDir, ".claude", "agents");
}

function renderAgentMd(entry: AgentEntry): string {
  return `---
name: ${entry.name}
description: "${entry.description}"
---

${entry.system_prompt}`;
}

export function generateAgents(
  workspaceDir: string,
  platform: Platform,
  agents: AgentEntry[],
  dryRun: boolean,
): string[] {
  const created: string[] = [];
  const baseDir = platformAgentDir(workspaceDir, platform);

  for (const entry of agents) {
    const filePath = join(baseDir, `${entry.name}.md`);
    const relPath = relative(workspaceDir, filePath);

    if (dryRun) {
      console.log(`  [dry-run] ${relPath}`);
    } else {
      writeFile(filePath, renderAgentMd(entry));
    }
    created.push(relPath);
  }

  return created;
}
