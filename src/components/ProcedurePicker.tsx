import { Button } from "./ui/button";
import { Input } from "./ui/input";

const COMING_AFTER_PARITY = [
  "Laparoscopic cholecystectomy",
  "Diagnostic laparoscopy +/- washout / adhesiolysis",
  "Incision and drainage of abscess",
  "Open inguinal hernia repair",
  "Open umbilical hernia repair",
  "Emergency laparotomy",
];

interface ProcedurePickerProps {
  selected: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectAppendicectomy: () => void;
}

export function ProcedurePicker({ selected, search, onSearchChange, onSelectAppendicectomy }: ProcedurePickerProps) {
  const showAppendicectomy = "laparoscopic appendicectomy".includes(search.trim().toLowerCase());

  return (
    <section aria-labelledby="procedure-heading" className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Stage 1</p>
        <h2 id="procedure-heading" className="font-serif text-2xl">Procedure</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select the operation before completing the procedure-specific fields.</p>
      </div>
      <div className="max-w-lg space-y-2">
        <label htmlFor="procedure-search" className="text-sm font-medium">Search procedures</label>
        <Input
          id="procedure-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by operation"
        />
      </div>
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
        {showAppendicectomy && (
          <Button
            aria-label="Laparoscopic appendicectomy"
            aria-pressed={selected}
            className="h-auto min-h-20 justify-start rounded-none bg-card px-4 py-3 text-left text-foreground hover:bg-muted data-[pressed=true]:border-l-4 data-[pressed=true]:border-primary"
            data-pressed={selected}
            onClick={onSelectAppendicectomy}
            type="button"
            variant="outline"
          >
            <span>
              <span className="block font-semibold">Laparoscopic appendicectomy</span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Emergency general surgery</span>
            </span>
          </Button>
        )}
        {COMING_AFTER_PARITY.map((procedure) => (
          <Button
            key={procedure}
            className="h-auto min-h-20 justify-start rounded-none bg-card px-4 py-3 text-left text-muted-foreground"
            disabled
            type="button"
            variant="outline"
          >
            {procedure} — coming after parity verification
          </Button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {showAppendicectomy ? "1 procedure available in this parity slice." : "No available procedures match this search."}
      </p>
    </section>
  );
}
