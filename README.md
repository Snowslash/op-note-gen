# Operative Note Generator

Single-page operative note generator for **laparoscopic appendicectomy**, **laparoscopic cholecystectomy**, and **incision and drainage of abscess**, built with:

- HTML
- CSS
- Vanilla JavaScript

The app is designed to speed up note drafting while keeping output structured, factual, and easy to review.

## Scope

This version supports:

- Laparoscopic appendicectomy
- Laparoscopic cholecystectomy
- Incision and drainage of abscess

## Features

- Structured input form with a compact two-column layout
- Generated operative note preview
- Copy-to-clipboard button
- Admin/team fields including:
  - surgeon
  - assistant
  - supervising consultant
  - anaesthetic
  - anaesthetist
  - additional team members
- Raw multiline handling for:
  - indication
  - findings
  - ports
  - appendix or gallbladder appearance
  - contamination description
  - bile or stone spillage details
  - abscess site, contents, packing, and wound management
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

1. Open [docs/index.html](./docs/index.html) in a browser.
2. Complete the form.
3. Select **Generate Note**.
4. Review the generated note.
5. Use **Copy to Clipboard** if needed.

There is no build step and no backend.

## Output Structure

The generated note can include:

- Procedure
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

- [docs/index.html](./docs/index.html) - app structure and form fields
- [docs/styles.css](./docs/styles.css) - layout and styling
- [docs/js/core.js](./docs/js/core.js) - shared DOM/state helpers and formatting utilities
- [docs/js/procedures.js](./docs/js/procedures.js) - procedure-specific configs and operation text generation
- [docs/js/app.js](./docs/js/app.js) - validation, rendering, event listeners, and app initialisation

## Notes

- [SPEC.md](./SPEC.md) captures the MVP scope and generation rules.
- This tool is for drafting assistance, not clinical decision-making.
