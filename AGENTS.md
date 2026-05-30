# AGENTS.md

## Agent Behaviour
- State assumptions when they materially affect implementation. Ask before choosing between genuinely different interpretations.
- Prefer the smallest change that satisfies the request; do not add speculative features, abstractions, configurability, or broad error handling unless asked.
- Make surgical edits: touch only files/lines required by the task. Do not drive-by refactor, reformat, rename, or clean up unrelated code.
- Preserve existing style and project shape even if you would design it differently.
- If you notice unrelated issues, mention them separately rather than fixing them silently.
- Define success criteria before substantial changes, then verify with the project's tests/build/lint/smoke checks before reporting completion.
- Remove only dead code/imports introduced by your own changes unless explicitly asked to clean wider code.

## Project Shape
- Static single-page app; there is no backend or build step.
- `package.json` only provides Node-based verification scripts; runtime remains no-build static HTML/CSS/JS.
- Runtime files live in `docs/` for GitHub Pages: `docs/index.html`, `docs/styles.css`, and the classic no-build scripts under `docs/js/`.
- `README.md` is the usage overview; `SPEC.md` is the source for MVP scope and clinical generation rules.

## Running And Verifying
- Open `docs/index.html` directly in a browser to view the landing page, then open `docs/app.html` for the generator.
- Run `npm run verify` before closing out code changes; this checks JavaScript syntax and the procedure smoke tests.
- For UI changes, check both desktop layout and the mobile breakpoints in `docs/styles.css`.

## Clinical Safety Constraints
- Do not add an AI rewriting layer or infer clinical details.
- Preserve user-entered free text as typed; generated HTML must remain escaped.
- Missing values should be omitted or rendered as `not specified` only where the existing generator does that.
- The generated note must remain clinician-reviewed drafting assistance, not decision-making.

## Code Orientation
- `docs/index.html` is the static landing page; `docs/app.html` owns the app form fields and output containers; field IDs must match the definitions under `docs/js/`.
- `docs/js/procedures.js` centralizes behavior in `PROCEDURES`; each supported operation gets its own procedure config.
- Add or change form data by updating the relevant field definition, visibility rule, validation/warning rule, and output section together.
- UI changes include compact procedure choice buttons backed by the hidden/fallback `procedureSelect`; keep both in sync and covered by tests.
- Theme changes use CSS custom properties and `data-theme` on the document element; keep dark mode local-only and non-clinical.
- Operation text is built by procedure-specific functions such as `buildAppendicectomyOperationText` and `buildCholecystectomyOperationText`; keep it rule-based, labelled, and factual.
- Operation output is structured as labelled lines; unanswered structured operation fields should render as `not specified`.
- Conditional custom select fields use `SELECT_OR_CUSTOM` plus matching visibility rules.

## Scope
- Current supported procedures are laparoscopic appendicectomy, laparoscopic cholecystectomy, diagnostic laparoscopy +/- washout / adhesiolysis, incision and drainage of abscess, open inguinal hernia repair, open umbilical hernia repair, and emergency laparotomy.
- Do not add further procedures unless explicitly asked; update `SPEC.md`, `README.md`, the procedure selector, and `PROCEDURES` together.
