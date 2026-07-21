import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PROCEDURE_DEFINITIONS } from "../domain";
import type { ProcedureDefinition, ProcedureId, SurgicalSpecialty } from "../domain";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Input } from "./ui/input";

const SPECIALTY_ORDER: readonly SurgicalSpecialty[] = ["trauma-orthopaedics", "general-surgery"];
const SPECIALTY_LABELS: Record<SurgicalSpecialty, string> = {
  "general-surgery": "General surgery",
  "trauma-orthopaedics": "Trauma and orthopaedics",
};

interface ProcedurePickerProps {
  selected: ProcedureId | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (procedureId: ProcedureId) => void;
}

function matchesQuery(procedure: ProcedureDefinition, query: string): boolean {
  if (!query) return true;
  return [procedure.label, procedure.category, ...procedure.keywords]
    .some((value) => value.toLowerCase().includes(query));
}

export function ProcedurePicker({ selected, search, onSearchChange, onSelect }: ProcedurePickerProps) {
  const query = search.trim().toLowerCase();
  const visibleProcedures = Object.values(PROCEDURE_DEFINITIONS).filter((procedure) => matchesQuery(procedure, query));
  const selectedSpecialty = selected ? PROCEDURE_DEFINITIONS[selected].specialty : null;
  const [openSpecialty, setOpenSpecialty] = useState<SurgicalSpecialty | null>(selectedSpecialty ?? "trauma-orthopaedics");

  return (
    <section aria-labelledby="procedure-heading" className="space-y-5">
      <div>
        <h2 id="procedure-heading" className="font-serif text-2xl">Procedure</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select the operation before completing the procedure-specific fields.</p>
      </div>
      <div className="max-w-lg space-y-2">
        <label htmlFor="procedure-search" className="text-sm font-medium">Search procedures</label>
        <Input id="procedure-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by operation, specialty or keyword" />
      </div>
      <div className="space-y-6">
        {SPECIALTY_ORDER.map((specialty) => {
          const specialtyProcedures = visibleProcedures.filter((procedure) => procedure.specialty === specialty);
          if (!specialtyProcedures.length) return null;
          const headingId = `specialty-${specialty}`;
          const isOpen = query ? true : openSpecialty === specialty;
          return (
            <Collapsible
              className="border border-border p-0"
              key={specialty}
              open={isOpen}
              onOpenChange={(open) => {
                if (query) return;
                setOpenSpecialty(open ? specialty : null);
              }}
            >
              <h3 id={headingId}>
                <CollapsibleTrigger className="group flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left font-serif text-xl">
                  <span>{SPECIALTY_LABELS[specialty]}</span>
                  <ChevronDown aria-hidden="true" className="size-5 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </h3>
              <CollapsibleContent className="p-0 text-foreground">
                <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
                  {specialtyProcedures.map((procedure) => (
                    <Button
                      aria-label={procedure.label}
                      aria-pressed={selected === procedure.id}
                      className="h-auto min-h-20 w-full min-w-0 justify-start whitespace-normal rounded-none bg-card px-4 py-3 text-left text-foreground hover:bg-muted data-[pressed=true]:border-l-4 data-[pressed=true]:border-primary"
                      data-pressed={selected === procedure.id}
                      key={procedure.id}
                      onClick={() => onSelect(procedure.id)}
                      type="button"
                      variant="outline"
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-semibold">{procedure.label}</span>
                        <span className="mt-1 block break-words text-xs font-normal text-muted-foreground">{procedure.category}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {visibleProcedures.length === 1 ? "1 procedure matches." : `${visibleProcedures.length} procedures match.`}
      </p>
    </section>
  );
}
