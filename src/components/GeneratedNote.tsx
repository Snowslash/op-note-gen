interface GeneratedNoteProps {
  text: string;
}

export function GeneratedNote({ text }: GeneratedNoteProps) {
  return (
    <section aria-labelledby="generated-note-heading" className="border-t border-border pt-5">
      <h2 id="generated-note-heading" className="font-serif text-xl">Generated note</h2>
      {text ? (
        <pre data-testid="generated-note" className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words border border-border bg-card p-4 text-sm leading-6">
          {text}
        </pre>
      ) : (
        <p className="mt-3 border border-border bg-card p-4 text-sm text-muted-foreground">Your operation note will appear here after generation.</p>
      )}
    </section>
  );
}
