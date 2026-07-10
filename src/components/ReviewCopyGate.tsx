import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface ReviewCopyGateProps {
  canReview: boolean;
  canCopy: boolean;
  reviewed: boolean;
  feedback: string;
  onReviewedChange: (reviewed: boolean) => void;
  onCopy: () => void;
}

export function ReviewCopyGate({ canReview, canCopy, reviewed, feedback, onReviewedChange, onCopy }: ReviewCopyGateProps) {
  return (
    <section aria-labelledby="review-copy-heading" className="border-t border-border pt-5">
      <h2 id="review-copy-heading" className="font-serif text-xl">Review confirmation</h2>
      <div className="mt-3 flex items-start gap-3">
        <Checkbox
          id="review-before-copy"
          checked={reviewed}
          disabled={!canReview}
          onCheckedChange={(checked) => onReviewedChange(checked === true)}
        />
        <label htmlFor="review-before-copy" className="text-sm leading-5">
          I have reviewed this generated draft and it reflects the current form entries.
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={!canCopy} onClick={onCopy} type="button" variant="outline">Copy to clipboard</Button>
        <span aria-live="polite" className="text-sm" role="status">{feedback}</span>
      </div>
    </section>
  );
}
