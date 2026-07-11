import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface WarningSummaryProps {
  warnings: string[];
}

export function WarningSummary({ warnings }: WarningSummaryProps) {
  return (
    <section aria-labelledby="advisory-warnings-heading" className="border-t border-border pt-5">
      <h2 id="advisory-warnings-heading" className="font-serif text-xl">Advisory warnings</h2>
      <p className="mt-1 text-sm text-muted-foreground">These prompts do not block draft generation.</p>
      {warnings.length ? (
        <Alert className="mt-3" role="status">
          <AlertTitle>Checks to review</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      ) : <p className="mt-3 text-sm">No advisory warnings.</p>}
    </section>
  );
}
