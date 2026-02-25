import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { writeFile, ensureDir } from "../utils.js";

function copyDirRecursive(
  src: string,
  dest: string,
  created: string[],
  baseDir: string,
): void {
  if (!existsSync(src)) return;
  ensureDir(dest);

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath, created, baseDir);
    } else {
      const content = readFileSync(srcPath, "utf-8");
      writeFile(destPath, content);
      created.push(relative(baseDir, destPath));
    }
  }
}

export function scaffoldWorkspace(
  targetDir: string,
  contentDir: string,
): string[] {
  const created: string[] = [];

  const dirs: Array<{ src: string; dest: string }> = [
    { src: "workflows", dest: "workflows" },
    { src: "templates", dest: "templates" },
    { src: "profiles", dest: "profiles" },
  ];

  for (const { src, dest } of dirs) {
    copyDirRecursive(
      join(contentDir, src),
      join(targetDir, dest),
      created,
      targetDir,
    );
  }

  const rootFiles: Array<{ src: string; dest: string }> = [
    { src: "rules/global-rules.md", dest: "global-rules.md" },
    { src: "rules/cursorrules", dest: ".cursorrules" },
    { src: "rules/CLAUDE.md", dest: "CLAUDE.md" },
    { src: "rules/system-prompt.md", dest: "system-prompt.md" },
    { src: "registry.yaml", dest: "registry.yaml" },
  ];

  for (const { src, dest } of rootFiles) {
    const srcPath = join(contentDir, src);
    if (existsSync(srcPath)) {
      const content = readFileSync(srcPath, "utf-8");
      writeFile(join(targetDir, dest), content);
      created.push(dest);
    }
  }

  const extraDirs = ["styles", "projects"];
  for (const dir of extraDirs) {
    ensureDir(join(targetDir, dir));
    created.push(`${dir}/`);
  }

  return created;
}
