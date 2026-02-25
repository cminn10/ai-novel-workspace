import { join, relative } from "path";
import type { WorkflowEntry, Platform } from "../types.js";
import { writeFile } from "../utils.js";
import { PLATFORM_CONFIG } from "../platforms.js";

function renderCommandMd(entry: WorkflowEntry): string {
  return `---
description: "${entry.description}"
---

读取并严格执行 \`workflows/${entry.file}\` 中的完整流程。不可跳步。
`;
}

export function generateCommands(
  workspaceDir: string,
  platform: Platform,
  workflows: WorkflowEntry[],
  dryRun: boolean,
): string[] {
  const commandsDir = PLATFORM_CONFIG[platform].commandsDir;
  if (!commandsDir) return [];

  const created: string[] = [];
  const baseDir = join(workspaceDir, commandsDir);

  for (const entry of workflows) {
    const filePath = join(baseDir, `${entry.skill}.md`);
    const relPath = relative(workspaceDir, filePath);

    if (dryRun) {
      console.log(`  [dry-run] ${relPath}`);
    } else {
      writeFile(filePath, renderCommandMd(entry));
    }
    created.push(relPath);
  }

  return created;
}
