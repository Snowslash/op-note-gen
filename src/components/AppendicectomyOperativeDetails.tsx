import type { AppendicectomyInput } from "../domain";
import type { AppendicectomyControlState } from "../app/appendicectomy-state";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

interface OperativeDetailsProps {
  values: AppendicectomyInput;
  controls: AppendicectomyControlState;
  onValueChange: (field: keyof AppendicectomyInput, value: string | boolean) => void;
  onCustomChoiceChange: (field: "entryTechnique" | "mesoappendixDivision" | "stumpControl", choice: string) => void;
  onCustomValueChange: (field: "entryTechnique" | "mesoappendixDivision" | "stumpControl", value: string) => void;
}

export function AppendicectomyOperativeDetails({ values, controls, onValueChange, onCustomChoiceChange, onCustomValueChange }: OperativeDetailsProps) {
  return (
    <section aria-labelledby="operative-details-heading" className="space-y-5">
      <div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 3</p><h2 id="operative-details-heading" className="font-serif text-2xl">Operative details</h2><p className="mt-1 text-sm text-muted-foreground">Appendicectomy-specific operative fields. Unanswered structured fields remain not specified in the draft.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Laparoscopic entry technique" value={controls.entryTechniqueChoice} onChange={(choice) => onCustomChoiceChange("entryTechnique", choice)} options={["Hasson", "Veress", "Optical entry", "Custom / other"]} />
        {controls.entryTechniqueChoice === "Custom / other" && <TextField label="Custom entry technique" value={controls.entryTechniqueCustom} onChange={(value) => onCustomValueChange("entryTechnique", value)} />}
        <TextAreaField className="sm:col-span-2" label="Ports used / port configuration" value={values.portsUsed} onChange={(value) => onValueChange("portsUsed", value)} />
        <TextAreaField className="sm:col-span-2" label="Appendix appearance / operative findings" value={values.appendixAppearance} onChange={(value) => onValueChange("appendixAppearance", value)} />
        <YesNoField label="Perforation" value={values.perforation} onChange={(value) => onValueChange("perforation", value)} />
        <YesNoField label="Contamination present" value={values.contaminationPresent} onChange={(value) => onValueChange("contaminationPresent", value)} />
        {values.contaminationPresent === "yes" && <TextAreaField className="sm:col-span-2" label="Contamination description" value={values.contaminationDescription} onChange={(value) => onValueChange("contaminationDescription", value)} />}
        <SelectField label="Mesoappendix division method" value={controls.mesoappendixDivisionChoice} onChange={(choice) => onCustomChoiceChange("mesoappendixDivision", choice)} options={["Electrocautery", "LigaSure", "Harmonic", "Clips and division", "Stapler", "Custom / other"]} />
        {controls.mesoappendixDivisionChoice === "Custom / other" && <TextField label="Custom mesoappendix division method" value={controls.mesoappendixDivisionCustom} onChange={(value) => onCustomValueChange("mesoappendixDivision", value)} />}
        <SelectField label="Stump control method" value={controls.stumpControlChoice} onChange={(choice) => onCustomChoiceChange("stumpControl", choice)} options={["Endoloops", "Stapler", "Clips", "Suture ligature", "Custom / other"]} />
        {controls.stumpControlChoice === "Custom / other" && <TextField label="Custom stump control method" value={controls.stumpControlCustom} onChange={(value) => onCustomValueChange("stumpControl", value)} />}
        <YesNoField label="Specimen removed in bag" value={values.specimenRemovedInBag} onChange={(value) => onValueChange("specimenRemovedInBag", value)} />
        <YesNoField label="Washout performed" value={values.washoutPerformed} onChange={(value) => onValueChange("washoutPerformed", value)} />
        <div className="grid gap-2"><div className="flex items-center gap-3"><Checkbox checked={values.convertedToOpen} id="converted-to-open" onCheckedChange={(checked) => onValueChange("convertedToOpen", checked === true)} /><label htmlFor="converted-to-open" className="text-sm font-medium">Converted to open</label></div></div>
        {values.convertedToOpen && <TextAreaField className="sm:col-span-2" label="Reason for conversion" value={values.conversionReason} onChange={(value) => onValueChange("conversionReason", value)} />}
        <TextAreaField className="sm:col-span-2" label="Additional operative details" value={values.additionalOperativeDetails} onChange={(value) => onValueChange("additionalOperativeDetails", value)} />
      </div>
    </section>
  );
}

function YesNoField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const base = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
  return <fieldset className="grid gap-2"><legend className="text-sm font-medium">{label}</legend><RadioGroup aria-label={label} className="flex gap-4" value={value} onValueChange={onChange}>{["yes", "no"].map((option) => <span className="flex items-center gap-2" key={option}><RadioGroupItem id={`${base}-${option}`} value={option} /><label htmlFor={`${base}-${option}`} className="text-sm">{label} {option}</label></span>)}</RadioGroup></fieldset>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
  return <label className="grid gap-1.5 text-sm font-medium" htmlFor={id}>{label}<select className="h-9 rounded-sm border border-input bg-card px-3 text-sm" id={id} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); return <label className="grid gap-1.5 text-sm font-medium" htmlFor={id}>{label}<Input id={id} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function TextAreaField({ className, label, value, onChange }: { className?: string; label: string; value: string; onChange: (value: string) => void }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, ""); return <label className={`grid gap-1.5 text-sm font-medium ${className ?? ""}`} htmlFor={id}>{label}<Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
