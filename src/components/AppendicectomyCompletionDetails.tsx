import type { AppendicectomyInput } from "../domain";
import type { AppendicectomyControlState } from "../app/appendicectomy-state";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

interface CompletionDetailsProps {
  values: AppendicectomyInput;
  controls: AppendicectomyControlState;
  onValueChange: (field: keyof AppendicectomyInput, value: string) => void;
  onDrainChoiceChange: (choice: string) => void;
  onDrainCustomValueChange: (value: string) => void;
}

export function AppendicectomyCompletionDetails({ values, controls, onValueChange, onDrainChoiceChange, onDrainCustomValueChange }: CompletionDetailsProps) {
  return (
    <section aria-labelledby="completion-heading" className="space-y-5">
      <div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 4</p><h2 id="completion-heading" className="font-serif text-2xl">Completion</h2><p className="mt-1 text-sm text-muted-foreground">Specimen, closure, and postoperative instructions.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Specimen" value={values.specimen} onChange={(value) => onValueChange("specimen", value)} />
        <YesNoField label="Drain placed" value={values.drainStatus} onChange={(value) => onValueChange("drainStatus", value)} />
        {values.drainStatus === "yes" && <SelectField label="Drain location" value={controls.drainLocationChoice} onChange={onDrainChoiceChange} options={["Pelvis", "Right iliac fossa", "Right paracolic gutter", "Left paracolic gutter", "Morrison's pouch", "Custom / other"]} />}
        {values.drainStatus === "yes" && controls.drainLocationChoice === "Custom / other" && <TextField label="Custom drain location" value={controls.drainLocationCustom} onChange={onDrainCustomValueChange} />}
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

function YesNoField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const base = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); return <fieldset className="grid gap-2"><legend className="text-sm font-medium">{label}?</legend><RadioGroup aria-label={label} className="flex gap-4" value={value} onValueChange={onChange}>{["yes", "no"].map((option) => <span className="flex items-center gap-2" key={option}><RadioGroupItem id={`${base}-${option}`} value={option} /><label htmlFor={`${base}-${option}`} className="text-sm">{label} {option}</label></span>)}</RadioGroup></fieldset>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); return <label className="grid gap-1.5 text-sm font-medium" htmlFor={id}>{label}<select className="h-9 rounded-sm border border-input bg-card px-3 text-sm" id={id} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); return <label className="grid gap-1.5 text-sm font-medium" htmlFor={id}>{label}<Input id={id} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function TextAreaField({ className, label, value, onChange }: { className?: string; label: string; value: string; onChange: (value: string) => void }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); return <label className={`grid gap-1.5 text-sm font-medium ${className ?? ""}`} htmlFor={id}>{label}<Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
