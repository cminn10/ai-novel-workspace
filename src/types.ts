export type Platform = "cursor" | "claude-code";

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
