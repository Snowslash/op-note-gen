import { Alert } from "../components/ui/alert";

export default function App() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-border pb-5">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Operation Note Generator</h1>
        </header>
        <section aria-label="Privacy and safety information" className="mt-6 space-y-3">
          <Alert>Do not enter patient-identifiable information.</Alert>
          <Alert>This tool runs entirely in your browser. No entered data is transmitted or stored by this site.</Alert>
          <Alert>Review generated text carefully before use in any clinical record.</Alert>
        </section>
      </div>
    </main>
  );
}
