import { downloadTemplate } from "giget";
import { load } from "js-yaml";
import { existsSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { Registry } from "./types.js";

const TEMPLATE_SOURCE = "github:cminn10/ai-novel-workspace/content";

export async function downloadContent(): Promise<{
  dir: string;
  cleanup: () => void;
}> {
  const dir = join(tmpdir(), `novel-ws-${Date.now()}`);
  await downloadTemplate(TEMPLATE_SOURCE, { dir });
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export function loadRegistry(contentDir: string): Registry {
  const raw = readFileSync(join(contentDir, "registry.yaml"), "utf-8");
  return load(raw) as Registry;
}

export async function resolveRegistry(cwd: string): Promise<{
  registry: Registry;
  cleanup?: () => void;
}> {
  const localPath = join(cwd, "registry.yaml");
  if (existsSync(localPath)) {
    return { registry: loadRegistry(cwd) };
  }
  const { dir, cleanup } = await downloadContent();
  return { registry: loadRegistry(dir), cleanup };
}
