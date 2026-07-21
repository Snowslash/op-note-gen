import { useState } from "react";
import {
  EstateBoundary,
  EstatePageTitle,
  EstateShell,
  PublicEstateHeader,
  useEstateTheme,
} from "@sangeev/estate-ui";
import { generateNote, getAdvisoryWarnings, validateProcedureInput } from "../domain";
import type { FieldValidationError, ImplantRecord, OutputMode, ProcedureId, ProcedureInput, TeamMember } from "../domain";
import { CompletionDetails } from "../components/CompletionDetails";
import { CoreDetails } from "../components/CoreDetails";
import { GeneratedNote } from "../components/GeneratedNote";
import { ProcedureOperativeDetails } from "../components/ProcedureOperativeDetails";
import { ProcedurePicker } from "../components/ProcedurePicker";
import { ReviewCopyGate } from "../components/ReviewCopyGate";

import { WarningSummary } from "../components/WarningSummary";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  createControlState,
  createDraftState,
  createImplantRecord,
  createProcedureInput,
  createTeamMember,
  ensureTeamMemberIds,
  moveImplantRecord,
  OUTPUT_MODES,
  type PreloadedProcedureInput,
  type ProcedureControlState,
  type DraftState,
  updateTeamMember,
  updateImplantRecord,
} from "./procedure-state";

import { WorkflowSteps } from "./workflow/WorkflowSteps";
import { WORKFLOW_STAGES, type WorkflowStage } from "./workflow/stages";

const stageIndex = (stage: WorkflowStage) => WORKFLOW_STAGES.indexOf(stage);

interface AppProps {
  initialInput?: PreloadedProcedureInput;
  initialOutputMode?: OutputMode;
  initialStage?: WorkflowStage;
}

export default function App({ initialInput, initialOutputMode = "full", initialStage = "Procedure" }: AppProps) {
  const [procedureSearch, setProcedureSearch] = useState("");
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(initialStage);
  const [furthestStageIndex, setFurthestStageIndex] = useState(() => initialInput ? stageIndex(initialStage) : 0);
  const [values, setValues] = useState<ProcedureInput | null>(() => initialInput ? ensureTeamMemberIds(initialInput) : null);
  const [controls, setControls] = useState<ProcedureControlState>(createControlState);
  const [outputMode, setOutputMode] = useState<OutputMode>(initialOutputMode);
  const [draft, setDraft] = useState<DraftState>(createDraftState);
  const [errors, setErrors] = useState<Partial<Record<FieldValidationError["field"], string>>>({});
  const [feedback, setFeedback] = useState("");
  const { theme, toggleTheme } = useEstateTheme();

  const invalidateDraft = (message = "Form details changed after generation. Regenerate before copying.") => {
    setDraft((previous) => previous.text ? { ...previous, fresh: false, reviewed: false } : previous);
    if (draft.text) setFeedback(message);
  };

  const selectProcedure = (procedureId: ProcedureId) => {
    if (values?.procedureId === procedureId) return;
    setValues(createProcedureInput(procedureId));
    setControls(createControlState());
    setDraft(createDraftState());
    setErrors({});
    setFeedback("");
    setOutputMode("full");
    setFurthestStageIndex(0);
  };

  const updateValue = (field: string, value: string | boolean, clearFields: string[] = []) => {
    setValues((previous) => {
      if (!previous) return previous;
      const updates = Object.fromEntries(clearFields.map((clearField) => [clearField, clearField === "implants" ? [] : ""]));
      return { ...previous, [field]: value, ...updates } as ProcedureInput;
    });
    if (field === "drainStatus" && value !== "yes" && controls.drainLocationChoice === "Custom / other") {
      setControls((previous) => ({ ...previous, drainLocationCustom: "" }));
      setValues((previous) => previous ? { ...previous, drainLocation: "" } as ProcedureInput : previous);
    }
    invalidateDraft();
  };

  const updateCustomChoice = (field: string, choice: string, options: readonly string[]) => {
    setControls((previous) => ({
      ...previous,
      choices: {
        ...previous.choices,
        [field]: {
          choice,
          custom: choice === "Custom / other" ? previous.choices[field]?.custom ?? "" : "",
        },
      },
    }));
    updateValue(field, choice === "Custom / other" ? "" : options.includes(choice) ? choice : "");
  };

  const updateCustomValue = (field: string, value: string) => {
    setControls((previous) => ({
      ...previous,
      choices: {
        ...previous.choices,
        [field]: { choice: "Custom / other", custom: value },
      },
    }));
    updateValue(field, value);
  };

  const updateDrainChoice = (choice: string) => {
    setControls((previous) => ({ ...previous, drainLocationChoice: choice, ...(choice === "Custom / other" ? {} : { drainLocationCustom: "" }) }));
    updateValue("drainLocation", choice === "Custom / other" ? "" : choice);
  };

  const updateDrainCustom = (value: string) => {
    setControls((previous) => ({ ...previous, drainLocationCustom: value }));
    updateValue("drainLocation", value);
  };

  const validateCoreDetails = () => {
    if (!values) return false;
    const result = validateProcedureInput(values);
    const coreErrors = result.errors.filter((error) => error.field !== "implantsUsed");
    setErrors(Object.fromEntries(coreErrors.map((error) => [error.field, error.message])));
    return coreErrors.length === 0;
  };

  const moveToStage = (stage: WorkflowStage) => {
    if (stageIndex(stage) <= furthestStageIndex) setCurrentStage(stage);
  };

  const moveNext = () => {
    const currentIndex = stageIndex(currentStage);
    if (currentStage === "Procedure" && !values) return;
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
    if (!values) return;
    const validation = validateProcedureInput(values);
    setErrors(Object.fromEntries(validation.errors.map((error) => [error.field, error.message])));
    if (!validation.valid) {
      setCurrentStage(validation.errors.some((error) => error.field === "implantsUsed") ? "Operative details" : "Core details");
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
    setValues((previous) => previous ? { ...previous, additionalTeamMembers: updateTeamMember(previous.additionalTeamMembers, index, changes) } as ProcedureInput : previous);
    invalidateDraft();
  };

  const addImplant = () => {
    setValues((previous) => previous && "implants" in previous
      ? { ...previous, implants: [...previous.implants, createImplantRecord()] }
      : previous);
    invalidateDraft();
  };

  const removeImplant = (id: string) => {
    setValues((previous) => previous && "implants" in previous
      ? { ...previous, implants: previous.implants.filter((implant) => implant.id !== id) }
      : previous);
    invalidateDraft();
  };

  const changeImplant = (id: string, changes: Partial<Omit<ImplantRecord, "id">>) => {
    setValues((previous) => previous && "implants" in previous
      ? { ...previous, implants: updateImplantRecord(previous.implants, id, changes) }
      : previous);
    invalidateDraft();
  };

  const moveImplant = (id: string, direction: "up" | "down") => {
    setValues((previous) => previous && "implants" in previous
      ? { ...previous, implants: moveImplantRecord(previous.implants, id, direction) }
      : previous);
    invalidateDraft();
  };

  const isReviewStage = currentStage === "Review and copy";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicEstateHeader current="opnotes" theme={theme} onToggleTheme={toggleTheme} />
      <EstateShell as="main" variant="standard-app" className="pb-6 sm:pb-10">
        <header className="border-b border-border pb-5 pt-6 sm:pt-10">
          <div>
            <EstatePageTitle variant="app">Operation Note Generator</EstatePageTitle>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Complete structured fields to generate a clinician-reviewed draft operation note.</p>
          </div>
        </header>
        <EstateBoundary as="section" variant="grid" label="Privacy and safety information" className="my-6">
          <p className="text-sm"><strong>Do not enter patient-identifiable information.</strong></p>
          <p className="text-sm">This tool runs entirely in your browser. No entered data is transmitted or stored by this site.</p>
          <p className="text-sm">Review generated text carefully before use in any clinical record.</p>
        </EstateBoundary>
        <WorkflowSteps currentStage={currentStage} furthestStageIndex={furthestStageIndex} onStageChange={moveToStage} />
        <div className="mt-6">
          <section className="min-w-0" aria-live="polite">
            {currentStage === "Procedure" && <ProcedurePicker selected={values?.procedureId ?? null} search={procedureSearch} onSearchChange={setProcedureSearch} onSelect={selectProcedure} />}
            {currentStage === "Core details" && values && <CoreDetails values={values} errors={errors} onValueChange={updateValue} onAddTeamMember={() => { setValues((previous) => previous ? { ...previous, additionalTeamMembers: [...previous.additionalTeamMembers, createTeamMember()] } as ProcedureInput : previous); invalidateDraft(); }} onRemoveTeamMember={(index) => { setValues((previous) => previous ? { ...previous, additionalTeamMembers: previous.additionalTeamMembers.filter((_, memberIndex) => memberIndex !== index) } as ProcedureInput : previous); invalidateDraft(); }} onTeamMemberChange={changeTeamMember} />}
            {currentStage === "Operative details" && values && <ProcedureOperativeDetails values={values} controls={controls} errors={errors} onValueChange={updateValue} onCustomChoiceChange={updateCustomChoice} onCustomValueChange={updateCustomValue} onAddImplant={addImplant} onRemoveImplant={removeImplant} onMoveImplant={moveImplant} onImplantChange={changeImplant} />}
            {currentStage === "Completion" && values && <CompletionDetails values={values} controls={controls} onValueChange={updateValue} onDrainChoiceChange={updateDrainChoice} onDrainCustomValueChange={updateDrainCustom} />}
            {isReviewStage && values && (
              <section aria-labelledby="review-heading" className="space-y-5">
                <div><h2 id="review-heading" className="font-serif text-2xl">Review and copy</h2><p className="mt-1 text-sm text-muted-foreground">Generate a plain-text draft, then confirm review before copying.</p></div>
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
            {!isReviewStage && <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5"><Button disabled={currentStage === "Procedure"} onClick={moveBack} type="button" variant="outline">Back</Button><Button disabled={currentStage === "Procedure" && !values} onClick={moveNext} type="button">Next</Button></div>}
          </section>
        </div>
      </EstateShell>
    </div>
  );
}
