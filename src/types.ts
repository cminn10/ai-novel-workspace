export type Platform = "cursor" | "claude-code" | "antigravity";

export interface PlatformConfig {
  label: string;
  detectDir: string;
  skillsDir: string;
  agentsDir: string;
  commandsDir: string | null;
  ruleFile: { src: string; dest: string };
}

export interface WorkflowEntry {
  skill: string;
  file: string;
  description: string;
  agents: string[];
}

export interface AgentEntry {
  name: string;
  description: string;
  workflow_ref: string;
  system_prompt: string;
}

export interface Registry {
  workflows: WorkflowEntry[];
  agents: AgentEntry[];
}
