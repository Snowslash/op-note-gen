import { PROCEDURE_DEFINITIONS } from "../domain";
import type { ProcedureId } from "../domain";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const PROCEDURE_META: Record<ProcedureId, string> = {
  "lap-appendicectomy": "Emergency general surgery",
  "lap-cholecystectomy": "Biliary surgery",
  "diagnostic-laparoscopy": "Laparoscopy ± washout / adhesiolysis",
  "incision-and-drainage": "Abscess surgery",
  "open-inguinal-hernia-repair": "Hernia surgery",
  "open-umbilical-hernia-repair": "Hernia surgery",
  "emergency-laparotomy": "Emergency general surgery",
};

interface ProcedurePickerProps {
  selected: ProcedureId | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (procedureId: ProcedureId) => void;
}

export function ProcedurePicker({ selected, search, onSearchChange, onSelect }: ProcedurePickerProps) {
  const query = search.trim().toLowerCase();
  const visibleProcedures = Object.values(PROCEDURE_DEFINITIONS).filter((procedure) => procedure.label.toLowerCase().includes(query));

  return (
    <section aria-labelledby="procedure-heading" className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 1</p>
        <h2 id="procedure-heading" className="font-serif text-2xl">Procedure</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select the operation before completing the procedure-specific fields.</p>
      </div>
      <div className="max-w-lg space-y-2">
        <label htmlFor="procedure-search" className="text-sm font-medium">Search procedures</label>
        <Input id="procedure-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by operation" />
      </div>
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
        {visibleProcedures.map((procedure) => (
          <Button
            aria-label={procedure.label}
            aria-pressed={selected === procedure.id}
            className="h-auto min-h-20 justify-start rounded-none bg-card px-4 py-3 text-left text-foreground hover:bg-muted data-[pressed=true]:border-l-4 data-[pressed=true]:border-primary"
            data-pressed={selected === procedure.id}
            key={procedure.id}
            onClick={() => onSelect(procedure.id)}
            type="button"
            variant="outline"
          >
            <span>
              <span className="block font-semibold">{procedure.label}</span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">{PROCEDURE_META[procedure.id]}</span>
            </span>
          </Button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {visibleProcedures.length === 1 ? "1 procedure matches." : `${visibleProcedures.length} procedures match.`}
      </p>
    </section>
  );
}
