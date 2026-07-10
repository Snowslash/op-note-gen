import { cloneElement, isValidElement, type ReactNode } from "react";
import type { CommonProcedureInput, TeamMember } from "../domain";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface CoreDetailsProps {
  values: CommonProcedureInput;
  errors: Partial<Record<"indication" | "findings", string>>;
  onValueChange: (field: string, value: string) => void;
  onAddTeamMember: () => void;
  onRemoveTeamMember: (index: number) => void;
  onTeamMemberChange: (index: number, changes: Partial<TeamMember>) => void;
}

const ANAESTHETIC_OPTIONS = ["", "GA", "Regional", "Local"];

export function CoreDetails({
  values,
  errors,
  onValueChange,
  onAddTeamMember,
  onRemoveTeamMember,
  onTeamMemberChange,
}: CoreDetailsProps) {
  return (
    <section aria-labelledby="core-details-heading" className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 2</p>
        <h2 id="core-details-heading" className="font-serif text-2xl">Core details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Core identifiers and required clinical context.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date/time"><Input type="datetime-local" value={values.operationDateTime} onChange={(event) => onValueChange("operationDateTime", event.target.value)} /></Field>
        <Field label="Surgeon"><Input value={values.surgeon} onChange={(event) => onValueChange("surgeon", event.target.value)} /></Field>
        <Field label="Assistant"><Input value={values.assistant} onChange={(event) => onValueChange("assistant", event.target.value)} /></Field>
        <Field label="Supervising consultant"><Input value={values.supervisingConsultant} onChange={(event) => onValueChange("supervisingConsultant", event.target.value)} /></Field>
        <Field label="Anaesthetic">
          <select aria-label="Anaesthetic" className="h-9 w-full rounded-sm border border-input bg-card px-3 text-sm" value={values.anaesthetic} onChange={(event) => onValueChange("anaesthetic", event.target.value)}>
            {ANAESTHETIC_OPTIONS.map((option) => <option key={option} value={option}>{option || "Select anaesthetic"}</option>)}
          </select>
        </Field>
        <Field label="Anaesthetist"><Input value={values.anaesthetist} onChange={(event) => onValueChange("anaesthetist", event.target.value)} /></Field>
      </div>
      <section aria-labelledby="team-members-heading" className="border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div><h3 id="team-members-heading" className="font-semibold">Additional team members</h3><p className="text-sm text-muted-foreground">Add extra surgeons or assistants if needed.</p></div>
          <Button onClick={onAddTeamMember} size="sm" type="button" variant="outline">Add team member</Button>
        </div>
        <div className="mt-3 space-y-3">
          {values.additionalTeamMembers.map((member, index) => (
            <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-[10rem_1fr_auto]" key={index}>
              <Field id={`team-member-role-${index}`} label="Team member role"><select aria-label="Team member role" className="h-9 w-full rounded-sm border border-input bg-card px-3 text-sm" value={member.role} onChange={(event) => onTeamMemberChange(index, { role: event.target.value })}><option value="Surgeon">Surgeon</option><option value="Assistant">Assistant</option></select></Field>
              <Field id={`team-member-name-${index}`} label="Team member name"><Input aria-label="Team member name" value={member.name} onChange={(event) => onTeamMemberChange(index, { name: event.target.value })} /></Field>
              <Button className="self-end" onClick={() => onRemoveTeamMember(index)} size="sm" type="button" variant="outline">Remove</Button>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-4">
        <Field label="Indication"><Textarea aria-invalid={Boolean(errors.indication)} aria-describedby={errors.indication ? "indication-error" : undefined} value={values.indication} onChange={(event) => onValueChange("indication", event.target.value)} /></Field>
        {errors.indication && <p id="indication-error" className="text-sm text-destructive">{errors.indication}</p>}
        <Field label="Findings"><Textarea aria-invalid={Boolean(errors.findings)} aria-describedby={errors.findings ? "findings-error" : undefined} value={values.findings} onChange={(event) => onValueChange("findings", event.target.value)} /></Field>
        {errors.findings && <p id="findings-error" className="text-sm text-destructive">{errors.findings}</p>}
      </div>
    </section>
  );
}

function Field({ children, id, label }: { children: ReactNode; id?: string; label: string }) {
  const fieldId = id ?? label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
  return <label className="grid gap-1.5 text-sm font-medium" htmlFor={fieldId}>{label}{cloneWithId(children, fieldId)}</label>;
}

function cloneWithId(children: ReactNode, id: string) {
  if (!isValidElement<{ id?: string }>(children)) return children;
  return cloneElement(children, { id });
}
