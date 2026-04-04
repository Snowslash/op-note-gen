# Operative Note Generator

Single-page operative note generator for **laparoscopic appendicectomy**, built with:

- HTML
- CSS
- Vanilla JavaScript

The app is designed to speed up note drafting while keeping output structured, factual, and easy to review.

## Scope

This version supports **laparoscopic appendicectomy only**.

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
  - contamination description
  - conversion reason
  - additional operative details
- Rule-based operation narrative generation
- Conditional handling for:
  - drain details
  - contamination
  - washout
  - conversion to open
  - closure details
- Non-blocking warnings for missing specimen, complications, and drain status

## Safety Rules

- No invented clinical details
- No AI rewriting layer
- User-entered free text is preserved as typed
- Missing fields are omitted or shown as `not specified` where appropriate
- Required fields must be completed before note generation
- The generated note should always be reviewed by the clinician before use

## How To Use

1. Open [index.html](./index.html) in a browser.
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

- [index.html](./index.html) - app structure and form fields
- [styles.css](./styles.css) - layout and styling
- [script.js](./script.js) - conditional UI logic and note generation

## Notes

- `SPEC.md` is intentionally ignored by git in this repository.
- This tool is for drafting assistance, not clinical decision-making.
