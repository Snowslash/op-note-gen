# Operative Note Generator

A static browser-based operative note drafting tool for common emergency and general surgical procedures.

The app helps clinicians turn structured intra-operative information into a clear draft note. It does not use a backend, upload patient data, call an AI service or invent clinical details.

## Supported Procedures

- Laparoscopic appendicectomy
- Laparoscopic cholecystectomy
- Diagnostic laparoscopy +/- washout / adhesiolysis
- Incision and drainage of abscess
- Open inguinal hernia repair
- Open umbilical hernia repair
- Emergency laparotomy

## Features

- Single-page HTML, CSS and vanilla JavaScript app
- Procedure-specific structured forms
- Accessible procedure dropdown with compact procedure buttons
- Editable auto-filled date and time
- Team fields for surgeon, assistant, supervising consultant, anaesthetic, anaesthetist and additional staff
- Rule-based operative note generation
- Output modes for:
  - full operative note
  - post-operative plan only
  - ward handover summary
- Conditional fields for drains, contamination, washout, conversion to open, bile or stone spillage, cholangiogram, closure, mesh, laparotomy modules, post-operative care and prophylaxis
- Non-blocking warnings for missing specimen, complications and drain status
- Stale-output warning after form edits
- Explicit review step before copying generated text
- Dark mode with local browser preference persistence

## Safety Model

This is a drafting aid, not a clinical decision-making tool.

- No AI rewriting layer
- No invented clinical details
- User-entered free text is preserved as typed
- Missing fields are omitted or shown as `not specified` where appropriate
- Unanswered structured operation fields are shown as `not specified`
- Required fields must be completed before note generation
- Generated output is marked stale after edits until regenerated
- Clipboard copy requires explicit review of the current generated draft
- The final note must be reviewed and corrected by the responsible clinician before use

## Privacy and Data Handling

- Runs entirely in the browser
- No backend
- No database
- No upload
- No analytics
- No AI/API calls
- Clipboard access only occurs when the user selects **Copy to Clipboard**
- Dark-mode preference is stored locally in the browser

Do not enter identifiable patient information into any hosted copy unless the deployment environment has been reviewed and approved for that use.

## Quick Start

Open the app directly in a browser:

1. Open [docs/index.html](./docs/index.html).
2. Select **Open generator**.

You can also open [docs/app.html](./docs/app.html) directly.

No build step is required.

## Using the App

1. Choose the operation.
2. Complete the required fields and any relevant optional fields.
3. Select **Generate Note**.
4. Review the generated draft carefully.
5. If the draft is accurate, confirm review and use **Copy to Clipboard** if needed.
6. Paste into the approved clinical record system and make any final edits there.

## Local Verification

Requires Node.js and npm.

```bash
npm run verify
```

This runs JavaScript syntax checks and procedure smoke tests.

Available scripts:

```bash
npm run check:js
npm test
npm run verify
```

## Output Structure

Depending on the selected procedure and completed fields, the generated note can include:

- Procedure
- Date/time
- Surgeon / assistant
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
- Post-operative plan, including antibiotic prophylaxis, DVT prophylaxis and care instructions

## Project Structure

- [docs/index.html](./docs/index.html) - static landing page
- [docs/app.html](./docs/app.html) - app shell and form markup
- [docs/styles.css](./docs/styles.css) - landing page and app styling
- [docs/theme.js](./docs/theme.js) - theme handling
- [docs/js/core.js](./docs/js/core.js) - shared DOM, state and formatting helpers
- [docs/js/note-formatters.js](./docs/js/note-formatters.js) - common output section builders and note-formatting helpers
- [docs/js/procedures.js](./docs/js/procedures.js) - procedure-specific configuration and operation text generation
- [docs/js/app.js](./docs/js/app.js) - validation, rendering, event listeners and app initialisation
- [tests/procedure-smoke.test.js](./tests/procedure-smoke.test.js) - procedure wiring and generated-note regression tests
- [SPEC.md](./SPEC.md) - scope and generation rules
- [PRODUCT.md](./PRODUCT.md) - product rationale and user-facing behaviour
- [DESIGN.md](./DESIGN.md) - visual design notes

## Clinical Disclaimer

This project produces draft text only. It does not replace clinical judgement, local documentation policy, consent requirements, operation-specific safety checks or senior review where required.
