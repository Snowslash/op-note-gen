# Operative Note Generator

Single-page operative note generator for **laparoscopic appendicectomy**, **laparoscopic cholecystectomy**, **diagnostic laparoscopy +/- washout / adhesiolysis**, **incision and drainage of abscess**, **open inguinal hernia repair**, **open umbilical hernia repair**, and **emergency laparotomy**, built with:

- HTML
- CSS
- Vanilla JavaScript

The app is designed to speed up note drafting while keeping output structured, factual, and easy to review.

## Scope

This version supports:

- Laparoscopic appendicectomy
- Laparoscopic cholecystectomy
- Diagnostic laparoscopy +/- washout / adhesiolysis
- Incision and drainage of abscess
- Open inguinal hernia repair
- Open umbilical hernia repair
- Emergency laparotomy

## Features

- Structured input form with a compact two-column layout
- Compact procedure choice buttons backed by an accessible fallback dropdown
- Dark mode toggle with local preference persistence
- Generated operative note preview
- Copy-to-clipboard button
- Admin/team fields including:
  - surgeon
  - assistant
  - supervising consultant
  - anaesthetic
  - anaesthetist
  - additional team members
  - autofilled editable date/time
- Raw multiline handling for:
  - indication
  - findings
  - ports
  - appendix, gallbladder, abdominal survey, or abscess/wound appearance
  - contamination description
  - bile or stone spillage details
  - washout, adhesiolysis, source control, abscess site, contents, packing/drain details, hernia sac, mesh, cord structures, ilioinguinal nerve status, umbilical hernia defect size, umbilical repair method, laparotomy pathology, bowel resection, anastomosis, stoma, and temporary abdominal closure
  - cholangiogram findings
  - conversion reason
  - additional operative details
- Rule-based structured operation detail generation
- Conditional handling for:
  - drain details
  - contamination
  - washout
  - conversion to open
  - bile or stone spillage
  - intraoperative cholangiogram
  - closure details
  - mesh details for open inguinal and open umbilical hernia repair
  - emergency laparotomy modules for bowel resection, anastomosis, stoma, washout, and temporary abdominal closure
- Non-blocking warnings for missing specimen, complications, and drain status

## Safety Rules

- No invented clinical details
- No AI rewriting layer
- User-entered free text is preserved as typed
- Missing fields are omitted or shown as `not specified` where appropriate
- Unanswered structured operation fields are shown as `not specified`
- Required fields must be completed before note generation
- The generated note should always be reviewed by the clinician before use

## How To Use

1. Open the landing page at [docs/index.html](./docs/index.html).
2. Select **Open generator**, or open [docs/app.html](./docs/app.html) directly.
3. Choose the operation using the compact procedure buttons.
4. Complete the form.
5. Select **Generate Note**.
6. Review the generated note.
7. Use **Copy to Clipboard** if needed.

There is no build step and no backend. For local verification, run:

```bash
npm run verify
```

This performs JavaScript syntax checks and runs the procedure smoke tests.

## Output Structure

The generated note can include:

- Procedure
- Date/time
- Surgeon / Assistant
- Additional team members
- Supervising consultant
- Anaesthetic
- Anaesthetist
- Indication
- Findings
- Ports
- Operation
- Specimen
- Drain
- Estimated blood loss
- Complications
- Closure
- Post-operative plan

## Project Files

- [docs/index.html](./docs/index.html) - static landing page
- [docs/app.html](./docs/app.html) - app structure and form fields
- [docs/styles.css](./docs/styles.css) - landing page and app styling
- `docs/js/core.js` centralizes shared DOM/state helpers and formatting utilities.
- `docs/js/note-formatters.js` centralizes common output section builders and note-formatting helpers.
- `docs/js/procedures.js` centralizes procedure-specific configs and operation text generation.
- `docs/js/app.js` handles validation, rendering, event listeners, and app initialisation.
- `tests/procedure-smoke.test.js` covers procedure wiring and generated-note safety regressions.

## Notes

- [SPEC.md](./SPEC.md) captures the MVP scope and generation rules.
- This tool is for drafting assistance, not clinical decision-making.
