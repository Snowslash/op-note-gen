export const WORKFLOW_STAGES = [
  "Procedure",
  "Core details",
  "Operative details",
  "Completion",
  "Review and copy",
] as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];
