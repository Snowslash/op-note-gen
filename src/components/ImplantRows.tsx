import type { ImplantRecord } from "../domain";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ImplantRowsProps {
  implants: ImplantRecord[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onChange: (id: string, changes: Partial<Omit<ImplantRecord, "id">>) => void;
}

const IMPLANT_FIELDS: ReadonlyArray<{
  key: keyof Omit<ImplantRecord, "id">;
  label: string;
}> = [
  { key: "component", label: "Component" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "productOrSystem", label: "Product / system" },
  { key: "size", label: "Size" },
  { key: "lotSerialOrReference", label: "Lot / serial / reference number" },
];

export function ImplantRows({ implants, onAdd, onRemove, onMove, onChange }: ImplantRowsProps) {
  return (
    <section aria-labelledby="implant-records-heading" className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
        <div>
          <h3 className="font-semibold" id="implant-records-heading">Implant records</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Copy available identifiers verbatim and verify the organisation's separate theatre implant-traceability record.</p>
        </div>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">Add implant</Button>
      </div>
      {implants.map((implant, index) => {
        const rowNumber = index + 1;
        return (
          <fieldset className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2" key={implant.id}>
            <legend className="font-medium">Implant {rowNumber}</legend>
            {IMPLANT_FIELDS.map((field) => {
              const id = `implant-${implant.id}-${field.key}`;
              const label = `Implant ${rowNumber} ${field.label.toLowerCase()}`;
              return (
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={id} key={field.key}>
                  {field.label}
                  <Input
                    aria-label={label}
                    id={id}
                    value={implant[field.key]}
                    onChange={(event) => onChange(implant.id, { [field.key]: event.target.value })}
                  />
                </label>
              );
            })}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button aria-label={`Move implant ${rowNumber} up`} disabled={index === 0} onClick={() => onMove(implant.id, "up")} size="sm" type="button" variant="outline">Move up</Button>
              <Button aria-label={`Move implant ${rowNumber} down`} disabled={index === implants.length - 1} onClick={() => onMove(implant.id, "down")} size="sm" type="button" variant="outline">Move down</Button>
              <Button aria-label={`Remove implant ${rowNumber}`} onClick={() => onRemove(implant.id)} size="sm" type="button" variant="outline">Remove implant</Button>
            </div>
          </fieldset>
        );
      })}
    </section>
  );
}
