# Impeccable / Hallmark workflow for opnotes

Use these tools as pressure tests, not as taste judges.

## Hallmark-style pass

Use Hallmark to challenge structure when a page feels AI-generated:

- Is the page using hero -> cards -> CTA -> footer by default?
- Are sections generic rather than needed?
- Does the page have bento/card theatre, fake status labels, abstract badges or SaaS reassurance copy?
- Would a clinician read it as a useful personal tool, or as a medical product pitch?

For this site, Hallmark suggestions must be filtered through `DESIGN.md`. Reject anything that pushes gradients, glass, bento grids, oversized editorial hero type, fake app chrome or generic launch-page rhythm.

## Impeccable pass

Use Impeccable for deterministic lint and focused polish:

```bash
impeccable detect docs/index.html
impeccable detect --json docs/index.html
```

Treat a clean result as "no obvious detector flags", not approval. The final gate is contextual: small clinical utility, Sangeev-maintained, browser-only and clinically cautious.

## Current lesson

The detector-clean dark landing-page prototype still felt too SaaS-like until the top copy became personal and the structure became plainer. The winning pattern was:

- serif headings, sans body/UI;
- dark default but warm, not premium/SaaS;
- no cards in the top section;
- first-person origin copy;
- safety notice close to the action;
- real screenshot plus plain generated-text excerpt.

## Install / verify

Global CLI tools:

```bash
npm install -g impeccable
impeccable --help
```

Agent skills:

```bash
npx skills add pbakaus/impeccable -g --all --copy
npx skills add nutlope/hallmark -g --all --copy
npx skills list -g --json
```

Hallmark is a skill, not the unrelated `hallmark` npm markdown linter. If `hallmark --help` talks about linting Markdown, do not use that as the design tool.
