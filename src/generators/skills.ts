import { join, relative } from "path";
import type { WorkflowEntry, Platform } from "../types.js";
import { writeFile } from "../utils.js";
import { PLATFORM_CONFIG } from "../platforms.js";

function renderSkillMd(entry: WorkflowEntry): string {
  return `---
name: ${entry.skill}
description: "${entry.description}"
---

读取并严格执行 \`workflows/${entry.file}\` 中的完整流程。不可跳步。
`;
}

export function generateSkills(
  workspaceDir: string,
  platform: Platform,
  workflows: WorkflowEntry[],
  dryRun: boolean,
): string[] {
  const created: string[] = [];
  const baseDir = join(workspaceDir, PLATFORM_CONFIG[platform].skillsDir);

  for (const entry of workflows) {
    const filePath = join(baseDir, entry.skill, "SKILL.md");
    const relPath = relative(workspaceDir, filePath);

    if (dryRun) {
      console.log(`  [dry-run] ${relPath}`);
    } else {
      writeFile(filePath, renderSkillMd(entry));
    }
    created.push(relPath);
  }

  return created;
}
