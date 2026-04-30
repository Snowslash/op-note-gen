# AGENTS.md

## Project Shape
- Static single-page app; there is no backend, package manifest, build step, or test runner.
- Runtime files live in `docs/` for GitHub Pages: `docs/index.html`, `docs/styles.css`, `docs/script.js`.
- `README.md` is the usage overview; `SPEC.md` is the source for MVP scope and clinical generation rules.

## Running And Verifying
- Open `docs/index.html` directly in a browser to run the app.
- Verify changes manually in the browser; there are no automated test/lint/typecheck commands configured.
- For UI changes, check both desktop layout and the mobile breakpoints in `docs/styles.css`.

## Clinical Safety Constraints
- Do not add an AI rewriting layer or infer clinical details.
- Preserve user-entered free text as typed; generated HTML must remain escaped.
- Missing values should be omitted or rendered as `not specified` only where the existing generator does that.
- The generated note must remain clinician-reviewed drafting assistance, not decision-making.

## Code Orientation
- `docs/index.html` owns form fields and output containers; field IDs must match `docs/script.js`.
- `docs/script.js` centralizes behavior in `PROCEDURES`; each supported operation gets its own procedure config.
- Add or change form data by updating the relevant field definition, visibility rule, validation/warning rule, and output section together.
- Operation narrative text is built by procedure-specific functions such as `buildAppendicectomyOperationText` and `buildCholecystectomyOperationText`; keep it rule-based and factual.
- Operation output is structured as labelled lines; unanswered structured operation fields should render as `not specified`.
- Conditional custom select fields use `SELECT_OR_CUSTOM` plus matching visibility rules.

## Scope
- Current supported procedures are laparoscopic appendicectomy and laparoscopic cholecystectomy.
- Do not add further procedures unless explicitly asked; update `SPEC.md`, the procedure selector, and `PROCEDURES` together.
