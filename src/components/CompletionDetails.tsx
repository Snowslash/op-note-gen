import type { CommonProcedureInput, OrthopaedicProcedureInput, ProcedureInput } from "../domain";
import type { ProcedureControlState } from "../app/procedure-state";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

interface CompletionDetailsProps {
  values: ProcedureInput;
  controls: ProcedureControlState;
  onValueChange: (field: string, value: string) => void;
  onDrainChoiceChange: (choice: string) => void;
  onDrainCustomValueChange: (value: string) => void;
}

const STANDARD_DRAIN_LOCATIONS = ["Pelvis", "Right iliac fossa", "Right paracolic gutter", "Left paracolic gutter", "Morrison's pouch"];

export function CompletionDetails(props: CompletionDetailsProps) {
  if ("caseClassification" in props.values) {
    return <OrthopaedicCompletionDetails values={props.values} onValueChange={props.onValueChange} />;
  }
  return <GeneralSurgeryCompletionDetails {...props} values={props.values} />;
}

function GeneralSurgeryCompletionDetails({ values, controls, onValueChange, onDrainChoiceChange, onDrainCustomValueChange }: Omit<CompletionDetailsProps, "values"> & { values: CommonProcedureInput }) {
  const valueIsStandard = STANDARD_DRAIN_LOCATIONS.includes(values.drainLocation);
  const drainChoice = controls.drainLocationChoice || (valueIsStandard ? values.drainLocation : values.drainLocation ? "Custom / other" : "");
  const drainCustom = controls.drainLocationCustom || (!valueIsStandard ? values.drainLocation : "");

  return (
    <section aria-labelledby="completion-heading" className="space-y-5">
      <div><h2 id="completion-heading" className="font-serif text-2xl">Completion</h2><p className="mt-1 text-sm text-muted-foreground">Specimen, drain, haemostasis, closure, and postoperative instructions.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Specimen" value={values.specimen} onChange={(value) => onValueChange("specimen", value)} />
        <YesNoField label="Drain placed" value={values.drainStatus} onChange={(value) => onValueChange("drainStatus", value)} />
        {values.drainStatus === "yes" && <SelectField label="Drain location" value={drainChoice} onChange={onDrainChoiceChange} options={[...STANDARD_DRAIN_LOCATIONS, "Custom / other"]} />}
        {values.drainStatus === "yes" && drainChoice === "Custom / other" && <TextField label="Custom drain location" value={drainCustom} onChange={onDrainCustomValueChange} />}
        <TextField label="Estimated blood loss" value={values.bloodLoss} onChange={(value) => onValueChange("bloodLoss", value)} />
        <TextField label="Complications" value={values.complications} onChange={(value) => onValueChange("complications", value)} />
        <YesNoField label="Haemostasis confirmed" value={values.haemostasisConfirmed} onChange={(value) => onValueChange("haemostasisConfirmed", value)} />
        <YesNoField label="Fascial closure performed" value={values.fascialClosurePerformed} onChange={(value) => onValueChange("fascialClosurePerformed", value)} />
        {values.fascialClosurePerformed === "yes" && <TextField label="Fascial suture material" value={values.fascialSutureMaterial} onChange={(value) => onValueChange("fascialSutureMaterial", value)} />}
        <TextField label="Skin closure method" value={values.skinClosureMethod} onChange={(value) => onValueChange("skinClosureMethod", value)} />
        <TextField label="Antibiotic prophylaxis" value={values.antibioticProphylaxis} onChange={(value) => onValueChange("antibioticProphylaxis", value)} />
        <TextField label="DVT prophylaxis" value={values.dvtProphylaxis} onChange={(value) => onValueChange("dvtProphylaxis", value)} />
        <TextAreaField className="sm:col-span-2" label="Post-operative care instructions" value={values.postOpPlan} onChange={(value) => onValueChange("postOpPlan", value)} />
      </div>
    </section>
  );
}

function OrthopaedicCompletionDetails({ values, onValueChange }: { values: OrthopaedicProcedureInput; onValueChange: (field: string, value: string) => void }) {
  return (
    <section aria-labelledby="completion-heading" className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl" id="completion-heading">Completion</h2>
        <p className="mt-1 text-sm text-muted-foreground">Record only the observed completion details and postoperative plan. No treatment or loading status is inferred.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaField label="Specimens / samples" value={values.specimensOrSamples} onChange={(value) => onValueChange("specimensOrSamples", value)} />
        <TextAreaField label="Tissue removed, added or altered" value={values.tissueDetails} onChange={(value) => onValueChange("tissueDetails", value)} />
        <TextField label="Estimated blood loss" value={values.bloodLoss} onChange={(value) => onValueChange("bloodLoss", value)} />
        <TextAreaField label="Complications" value={values.complications} onChange={(value) => onValueChange("complications", value)} />
        <TextAreaField label="Haemostasis details" value={values.haemostasisDetails} onChange={(value) => onValueChange("haemostasisDetails", value)} />
        <TextAreaField label="Closure details" value={values.closureDetails} onChange={(value) => onValueChange("closureDetails", value)} />
        <TextAreaField label="Dressing / immobilisation" value={values.dressingAndImmobilisation} onChange={(value) => onValueChange("dressingAndImmobilisation", value)} />
        <TextAreaField label="Antibiotic prophylaxis" value={values.antibioticProphylaxis} onChange={(value) => onValueChange("antibioticProphylaxis", value)} />
        <TextAreaField label="DVT prophylaxis" value={values.dvtProphylaxis} onChange={(value) => onValueChange("dvtProphylaxis", value)} />
        <TextAreaField label="Loading / weight-bearing instructions" value={values.loadingInstructions} onChange={(value) => onValueChange("loadingInstructions", value)} />
        <TextAreaField label="Post-operative monitoring / checks" value={values.postoperativeMonitoring} onChange={(value) => onValueChange("postoperativeMonitoring", value)} />
        <TextAreaField label="Post-operative imaging" value={values.postoperativeImaging} onChange={(value) => onValueChange("postoperativeImaging", value)} />
        <TextAreaField label="Wound care" value={values.woundCare} onChange={(value) => onValueChange("woundCare", value)} />
        <TextAreaField label="Physiotherapy / rehabilitation plan" value={values.rehabilitationPlan} onChange={(value) => onValueChange("rehabilitationPlan", value)} />
        <TextAreaField label="Follow-up" value={values.followUp} onChange={(value) => onValueChange("followUp", value)} />
        <TextAreaField className="sm:col-span-2" label="Other post-operative instructions" value={values.postOpPlan} onChange={(value) => onValueChange("postOpPlan", value)} />
      </div>
    </section>
  );
}

function YesNoField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const base = slug(label);
  return <fieldset className="grid gap-2"><legend className="text-sm font-medium">{label}?</legend><RadioGroup aria-label={label} className="flex gap-4" value={value} onValueChange={onChange}>{["yes", "no"].map((option) => <span className="flex items-center gap-2" key={option}><RadioGroupItem id={`${base}-${option}`} value={option} /><label htmlFor={`${base}-${option}`} className="text-sm">{label} {option}</label></span>)}</RadioGroup></fieldset>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { const id = slug(label); return <label className="grid gap-1.5 text-sm font-medium" htmlFor={id}>{label}<select className="h-9 rounded-sm border border-input bg-card px-3 text-sm" id={id} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const id = slug(label); return <label className="grid gap-1.5 text-sm font-medium" htmlFor={id}>{label}<Input id={id} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function TextAreaField({ className, label, value, onChange }: { className?: string; label: string; value: string; onChange: (value: string) => void }) { const id = slug(label); return <label className={`grid gap-1.5 text-sm font-medium ${className ?? ""}`} htmlFor={id}>{label}<Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function slug(value: string) { return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); }
