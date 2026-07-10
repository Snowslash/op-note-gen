import { useState } from "react";
import { generateNote, getAdvisoryWarnings, validateProcedureInput } from "../domain";
import type { AppendicectomyInput, OutputMode, TeamMember } from "../domain";
import { AppendicectomyCompletionDetails } from "../components/AppendicectomyCompletionDetails";
import { AppendicectomyCoreDetails } from "../components/AppendicectomyCoreDetails";
import { AppendicectomyOperativeDetails } from "../components/AppendicectomyOperativeDetails";
import { GeneratedNote } from "../components/GeneratedNote";
import { ProcedurePicker } from "../components/ProcedurePicker";
import { ReviewCopyGate } from "../components/ReviewCopyGate";
import { WarningSummary } from "../components/WarningSummary";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  createAppendicectomyInput,
  createControlState,
  createDraftState,
  OUTPUT_MODES,
  type AppendicectomyControlState,
  type DraftState,
  updateTeamMember,
} from "./appendicectomy-state";
import { WORKFLOW_STAGES, WorkflowSteps, type WorkflowStage } from "./workflow/WorkflowSteps";

const stageIndex = (stage: WorkflowStage) => WORKFLOW_STAGES.indexOf(stage);
const selectFieldFor = {
  entryTechnique: "entryTechniqueChoice",
  mesoappendixDivision: "mesoappendixDivisionChoice",
  stumpControl: "stumpControlChoice",
} as const;
const customFieldFor = {
  entryTechnique: "entryTechniqueCustom",
  mesoappendixDivision: "mesoappendixDivisionCustom",
  stumpControl: "stumpControlCustom",
} as const;

type SelectOrCustomField = keyof typeof selectFieldFor;

export default function App() {
  const [selectedProcedure, setSelectedProcedure] = useState(false);
  const [procedureSearch, setProcedureSearch] = useState("");
  const [currentStage, setCurrentStage] = useState<WorkflowStage>("Procedure");
  const [furthestStageIndex, setFurthestStageIndex] = useState(0);
  const [values, setValues] = useState<AppendicectomyInput>(createAppendicectomyInput);
  const [controls, setControls] = useState<AppendicectomyControlState>(createControlState);
  const [outputMode, setOutputMode] = useState<OutputMode>("full");
  const [draft, setDraft] = useState<DraftState>(createDraftState);
  const [errors, setErrors] = useState<Partial<Record<"indication" | "findings", string>>>({});
  const [feedback, setFeedback] = useState("");


  const invalidateDraft = (message = "Form details changed after generation. Regenerate before copying.") => {
    setDraft((previous) => previous.text ? { ...previous, fresh: false, reviewed: false } : previous);
    if (draft.text) setFeedback(message);
  };

  const updateValue = (field: keyof AppendicectomyInput, value: string | boolean) => {
    setValues((previous) => {
      const next = { ...previous, [field]: value } as AppendicectomyInput;
      if (field === "convertedToOpen" && value === false) next.conversionReason = "";
      return next;
    });
    if (field === "drainStatus" && value !== "yes" && controls.drainLocationChoice === "Custom / other") {
      setControls((previous) => ({ ...previous, drainLocationCustom: "" }));
      setValues((previous) => ({ ...previous, drainLocation: "" }));
    }
    invalidateDraft();
  };

  const updateCustomChoice = (field: SelectOrCustomField, choice: string) => {
    const choiceKey = selectFieldFor[field];
    const customKey = customFieldFor[field];
    setControls((previous) => ({ ...previous, [choiceKey]: choice, ...(choice === "Custom / other" ? {} : { [customKey]: "" }) }));
    setValues((previous) => ({ ...previous, [field]: choice === "Custom / other" ? "" : choice }));
    invalidateDraft();
  };

  const updateCustomValue = (field: SelectOrCustomField, value: string) => {
    const customKey = customFieldFor[field];
    setControls((previous) => ({ ...previous, [customKey]: value }));
    setValues((previous) => ({ ...previous, [field]: value }));
    invalidateDraft();
  };

  const updateDrainChoice = (choice: string) => {
    setControls((previous) => ({ ...previous, drainLocationChoice: choice, ...(choice === "Custom / other" ? {} : { drainLocationCustom: "" }) }));
    setValues((previous) => ({ ...previous, drainLocation: choice === "Custom / other" ? "" : choice }));
    invalidateDraft();
  };

  const updateDrainCustom = (value: string) => {
    setControls((previous) => ({ ...previous, drainLocationCustom: value }));
    setValues((previous) => ({ ...previous, drainLocation: value }));
    invalidateDraft();
  };

  const validateCoreDetails = () => {
    const result = validateProcedureInput(values);
    const nextErrors = Object.fromEntries(result.errors.map((error) => [error.field, error.message]));
    setErrors(nextErrors);
    return result.valid;
  };

  const moveToStage = (stage: WorkflowStage) => {
    if (stageIndex(stage) <= furthestStageIndex) setCurrentStage(stage);
  };

  const moveNext = () => {
    const currentIndex = stageIndex(currentStage);
    if (currentStage === "Procedure" && !selectedProcedure) return;
    if (currentStage === "Core details" && !validateCoreDetails()) return;
    const nextStage = WORKFLOW_STAGES[currentIndex + 1];
    if (!nextStage) return;
    setFurthestStageIndex((previous) => Math.max(previous, currentIndex + 1));
    setCurrentStage(nextStage);
  };

  const moveBack = () => {
    const previousStage = WORKFLOW_STAGES[stageIndex(currentStage) - 1];
    if (previousStage) setCurrentStage(previousStage);
  };

  const generateDraft = () => {
    if (!validateCoreDetails()) {
      setCurrentStage("Core details");
      return;
    }
    setDraft({
      text: generateNote(values, outputMode),
      warnings: getAdvisoryWarnings(values),
      fresh: true,
      reviewed: false,
    });
    setFeedback("Draft generated. Review it before copying.");
  };

  const copyDraft = async () => {
    if (!draft.text || !draft.fresh || !draft.reviewed) {
      setFeedback("Review the current generated draft before copying.");
      return;
    }
    if (typeof navigator.clipboard?.writeText !== "function") {
      setFeedback("Clipboard copy is unavailable. Please copy the note manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(draft.text);
      setFeedback("Operation note copied to clipboard.");
    } catch {
      setFeedback("Clipboard copy failed. Please copy the note manually.");
    }
  };

  const changeOutputMode = (mode: OutputMode) => {
    setOutputMode(mode);
    invalidateDraft("Output mode changed. Regenerate before copying.");
  };

  const changeTeamMember = (index: number, changes: Partial<TeamMember>) => {
    setValues((previous) => ({ ...previous, additionalTeamMembers: updateTeamMember(previous.additionalTeamMembers, index, changes) }));
    invalidateDraft();
  };

  const isReviewStage = currentStage === "Review and copy";

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-border pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Operation Note Generator v2</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Operation Note Generator</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Complete structured fields to generate a clinician-reviewed draft operation note.</p>
        </header>
        <section aria-label="Privacy and safety information" className="my-6 grid gap-2 border-y border-border py-4 sm:grid-cols-3">
          <p className="text-sm"><strong>Do not enter patient-identifiable information.</strong></p>
          <p className="text-sm">This tool runs entirely in your browser. No entered data is transmitted or stored by this site.</p>
          <p className="text-sm">Review generated text carefully before use in any clinical record.</p>
        </section>
        <WorkflowSteps currentStage={currentStage} furthestStageIndex={furthestStageIndex} onStageChange={moveToStage} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)]">
          <section className="min-w-0" aria-live="polite">
            {currentStage === "Procedure" && <ProcedurePicker selected={selectedProcedure} search={procedureSearch} onSearchChange={setProcedureSearch} onSelectAppendicectomy={() => setSelectedProcedure(true)} />}
            {currentStage === "Core details" && <AppendicectomyCoreDetails values={values} errors={errors} onValueChange={updateValue} onAddTeamMember={() => { setValues((previous) => ({ ...previous, additionalTeamMembers: [...previous.additionalTeamMembers, { role: "Assistant", name: "" }] })); invalidateDraft(); }} onRemoveTeamMember={(index) => { setValues((previous) => ({ ...previous, additionalTeamMembers: previous.additionalTeamMembers.filter((_, memberIndex) => memberIndex !== index) })); invalidateDraft(); }} onTeamMemberChange={changeTeamMember} />}
            {currentStage === "Operative details" && <AppendicectomyOperativeDetails values={values} controls={controls} onValueChange={updateValue} onCustomChoiceChange={updateCustomChoice} onCustomValueChange={updateCustomValue} />}
            {currentStage === "Completion" && <AppendicectomyCompletionDetails values={values} controls={controls} onValueChange={updateValue} onDrainChoiceChange={updateDrainChoice} onDrainCustomValueChange={updateDrainCustom} />}
            {isReviewStage && (
              <section aria-labelledby="review-heading" className="space-y-5">
                <div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 5</p><h2 id="review-heading" className="font-serif text-2xl">Review and copy</h2><p className="mt-1 text-sm text-muted-foreground">Generate a plain-text draft, then confirm review before copying.</p></div>
                <label className="grid max-w-md gap-1.5 text-sm font-medium" htmlFor="output-mode">Output mode<select className="h-9 rounded-sm border border-input bg-card px-3 text-sm" id="output-mode" value={outputMode} onChange={(event) => changeOutputMode(event.target.value as OutputMode)}>{OUTPUT_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}</select></label>
                {draft.text && !draft.fresh && <Alert><AlertTitle>Draft is stale</AlertTitle><AlertDescription>{feedback || "Form details changed after generation. Regenerate before copying."}</AlertDescription></Alert>}
                {draft.text && <WarningSummary warnings={draft.warnings} />}
                <GeneratedNote text={draft.text} />
                <Button onClick={generateDraft} type="button">Generate draft</Button>
                <ReviewCopyGate
                  canReview={Boolean(draft.text && draft.fresh)}
                  canCopy={Boolean(draft.text && draft.fresh && draft.reviewed)}
                  reviewed={draft.reviewed}
                  feedback={draft.fresh ? feedback : ""}
                  onReviewedChange={(reviewed) => {
                    if (!draft.text || !draft.fresh) return;
                    setDraft((previous) => ({ ...previous, reviewed }));
                    setFeedback(reviewed ? "Review confirmed. Copy is now available." : "Review confirmation removed. Copy is disabled.");
                  }}
                  onCopy={copyDraft}
                />
              </section>
            )}
            {currentStage === "Core details" && Object.keys(errors).length > 0 && <Alert className="mt-5"><AlertTitle>Please complete the required fields</AlertTitle><AlertDescription>{Object.values(errors).join(" ")}</AlertDescription></Alert>}
            {!isReviewStage && <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5"><Button disabled={currentStage === "Procedure"} onClick={moveBack} type="button" variant="outline">Back</Button><Button disabled={currentStage === "Procedure" && !selectedProcedure} onClick={moveNext} type="button">Next</Button></div>}
          </section>
          <aside className="min-w-0 self-start border-t border-border pt-5 lg:sticky lg:top-5">
            <h2 className="font-serif text-xl">Draft safety</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">No entered text is saved or transmitted. Generated drafts remain separate from advisory prompts and require explicit review before copy.</p>
            {!isReviewStage && draft.text && <WarningSummary warnings={draft.warnings} />}
            {!isReviewStage && draft.text && <GeneratedNote text={draft.text} />}
          </aside>
        </div>
      </div>
    </main>
  );
}
