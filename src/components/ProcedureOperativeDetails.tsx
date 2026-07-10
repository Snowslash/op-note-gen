import type { ProcedureInput } from "../domain";
import type { ProcedureControlState } from "../app/procedure-state";
import { PROCEDURE_FORM_DEFINITIONS, type ProcedureFieldDefinition, type SelectCustomFieldDefinition } from "../app/procedure-form-definitions";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

interface ProcedureOperativeDetailsProps {
  values: ProcedureInput;
  controls: ProcedureControlState;
  onValueChange: (field: string, value: string | boolean, clearFields?: string[]) => void;
  onCustomChoiceChange: (field: string, choice: string, options: readonly string[]) => void;
  onCustomValueChange: (field: string, value: string) => void;
}

export function ProcedureOperativeDetails({
  values,
  controls,
  onValueChange,
  onCustomChoiceChange,
  onCustomValueChange,
}: ProcedureOperativeDetailsProps) {
  const definition = PROCEDURE_FORM_DEFINITIONS[values.procedureId];
  const record = values as unknown as Record<string, string | boolean>;

  return (
    <section aria-labelledby="operative-details-heading" className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 3</p>
        <h2 id="operative-details-heading" className="font-serif text-2xl">Operative details</h2>
        <p className="mt-1 text-sm text-muted-foreground">{definition.hint}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {definition.fields.map((field) => isVisible(field, record) ? (
          <ProcedureField
            key={field.field}
            definition={field}
            procedureId={values.procedureId}
            value={record[field.field] ?? ""}
            control={controls.choices[field.field]}
            onValueChange={onValueChange}
            onCustomChoiceChange={onCustomChoiceChange}
            onCustomValueChange={onCustomValueChange}
          />
        ) : null)}
      </div>
    </section>
  );
}

function isVisible(field: ProcedureFieldDefinition, values: Record<string, string | boolean>) {
  return !field.showWhen || values[field.showWhen.field] === field.showWhen.equals;
}

interface ProcedureFieldProps {
  definition: ProcedureFieldDefinition;
  procedureId: string;
  value: string | boolean;
  control?: { choice: string; custom: string };
  onValueChange: (field: string, value: string | boolean, clearFields?: string[]) => void;
  onCustomChoiceChange: (field: string, choice: string, options: readonly string[]) => void;
  onCustomValueChange: (field: string, value: string) => void;
}

function ProcedureField({
  definition,
  procedureId,
  value,
  control,
  onValueChange,
  onCustomChoiceChange,
  onCustomValueChange,
}: ProcedureFieldProps) {
  const id = `${procedureId}-${definition.field}`;
  const className = definition.wide ? "grid gap-1.5 text-sm font-medium sm:col-span-2" : "grid gap-1.5 text-sm font-medium";

  if (definition.kind === "textarea") {
    return <label className={className} htmlFor={id}>{definition.label}<Textarea id={id} value={String(value)} onChange={(event) => onValueChange(definition.field, event.target.value)} /></label>;
  }

  if (definition.kind === "text") {
    return <label className={className} htmlFor={id}>{definition.label}<Input id={id} value={String(value)} onChange={(event) => onValueChange(definition.field, event.target.value)} /></label>;
  }

  if (definition.kind === "checkbox") {
    return (
      <div className={definition.wide ? "sm:col-span-2" : undefined}>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={Boolean(value)}
            id={id}
            onCheckedChange={(checked) => {
              const next = checked === true;
              onValueChange(definition.field, next, next === definition.clearRule?.unless ? undefined : definition.clearRule?.fields);
            }}
          />
          <label className="text-sm font-medium" htmlFor={id}>{definition.label}</label>
        </div>
      </div>
    );
  }

  if (definition.kind === "radio") {
    return (
      <fieldset className={definition.wide ? "grid gap-2 sm:col-span-2" : "grid gap-2"}>
        <legend className="text-sm font-medium">{definition.label}</legend>
        <RadioGroup aria-label={definition.label} className="flex flex-wrap gap-4" value={String(value)} onValueChange={(next) => onValueChange(definition.field, next, next === definition.clearRule?.unless ? undefined : definition.clearRule?.fields)}>
          {definition.options.map((option) => (
            <span className="flex items-center gap-2" key={option}>
              <RadioGroupItem id={`${id}-${slug(option)}`} value={option} />
              <label className="text-sm" htmlFor={`${id}-${slug(option)}`}>{definition.label} {option}</label>
            </span>
          ))}
        </RadioGroup>
      </fieldset>
    );
  }

  if (definition.kind === "select") {
    return (
      <label className={className} htmlFor={id}>
        {definition.label}
        <select
          className="h-9 rounded-sm border border-input bg-card px-3 text-sm"
          id={id}
          value={String(value)}
          onChange={(event) => {
            const next = event.target.value;
            onValueChange(definition.field, next, next === definition.clearRule?.unless ? undefined : definition.clearRule?.fields);
          }}
        >
          <option value="">Select {definition.label.toLowerCase()}</option>
          {definition.options.map((option) => <option key={option} value={option}>{displayOption(option)}</option>)}
        </select>
      </label>
    );
  }

  if (definition.kind !== "select-custom") return null;
  const customDefinition = definition as SelectCustomFieldDefinition;

  const valueString = String(value);
  const valueIsStandard = customDefinition.options.includes(valueString);
  const choice = control?.choice || (valueIsStandard ? valueString : valueString ? "Custom / other" : "");
  const custom = control?.custom || (!valueIsStandard ? valueString : "");

  return (
    <>
      <label className={className} htmlFor={id}>
        {definition.label}
        <select
          className="h-9 rounded-sm border border-input bg-card px-3 text-sm"
          id={id}
          value={choice}
          onChange={(event) => onCustomChoiceChange(customDefinition.field, event.target.value, customDefinition.options)}
        >
          <option value="">Select {definition.label.toLowerCase()}</option>
          {customDefinition.options.map((option) => <option key={option} value={option}>{option}</option>)}
          <option value="Custom / other">Custom / other</option>
        </select>
      </label>
      {choice === "Custom / other" && (
        <label className={className} htmlFor={`${id}-custom`}>
          {customDefinition.customLabel}
          <Input id={`${id}-custom`} value={custom} onChange={(event) => onCustomValueChange(customDefinition.field, event.target.value)} />
        </label>
      )}
    </>
  );
}

function displayOption(option: string) {
  if (option === "yes") return "Yes";
  if (option === "no") return "No";
  if (option === "not applicable") return "Not applicable";
  return option;
}

function slug(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
}
