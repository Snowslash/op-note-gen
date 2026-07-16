import { Button } from "../../components/ui/button";
import { WORKFLOW_STAGES, type WorkflowStage } from "./stages";

interface WorkflowStepsProps {
  currentStage: WorkflowStage;
  furthestStageIndex: number;
  onStageChange: (stage: WorkflowStage) => void;
}

export function WorkflowSteps({ currentStage, furthestStageIndex, onStageChange }: WorkflowStepsProps) {
  return (
    <nav aria-label="Workflow stages" className="border-y border-border py-3">
      <ol className="grid gap-1 sm:grid-cols-5">
        {WORKFLOW_STAGES.map((stage, index) => (
          <li key={stage}>
            <Button
              aria-current={stage === currentStage ? "step" : undefined}
              disabled={index > furthestStageIndex}
              onClick={() => onStageChange(stage)}
              size="sm"
              variant={stage === currentStage ? "default" : "ghost"}
              className="w-full justify-start text-left sm:justify-center"
              type="button"
            >
              {stage}
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
