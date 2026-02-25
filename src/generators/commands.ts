import { join, relative } from "path";
import type { WorkflowEntry } from "../types.js";
import { writeFile } from "../utils.js";

function renderCommandMd(entry: WorkflowEntry): string {
  return `---
description: "${entry.description}"
---

读取并严格执行 \`workflows/${entry.file}\` 中的完整流程。不可跳步。
`;
}

export function generateCommands(
  workspaceDir: string,
  workflows: WorkflowEntry[],
  dryRun: boolean,
): string[] {
  const created: string[] = [];
  const baseDir = join(workspaceDir, ".claude", "commands");

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
