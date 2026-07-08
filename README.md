# Operation Note Generator

Browser-only operation note drafting for common emergency general-surgery procedures.

The tool turns structured fields into a plain-text draft operation note. It does not use AI, call a backend, upload form contents, store patient data or make clinical decisions.

Live project page: https://opnotes.sangeev.me
Source: https://github.com/Snowslash/op-note-gen

## What it supports

- laparoscopic appendicectomy
- laparoscopic cholecystectomy
- diagnostic laparoscopy +/- washout / adhesiolysis
- incision and drainage of abscess
- open inguinal hernia repair
- open umbilical hernia repair
- emergency laparotomy

## How to use it

1. Open the generator.
2. Choose the operation.
3. Complete the required fields and any useful optional fields.
4. Generate the note.
5. Review and edit the generated text before copying it into the clinical record.

Do not enter patient-identifiable information into public pages or repositories. Any real clinical note remains the responsibility of the clinician using it.

## Privacy and safety boundary

- Runs entirely in the browser.
- No login.
- No backend or database.
- No analytics.
- No AI or external API calls.
- Clipboard access happens only when the user selects the copy action.
- Theme preference is stored locally in the browser.

This is a drafting aid, not decision support, clinical validation, local policy, consent checking or senior review.

## Run locally

No build step is required.

```bash
git clone https://github.com/Snowslash/op-note-gen.git
cd op-note-gen
python3 -m http.server 8000 --directory docs
```

Then open:

```text
http://127.0.0.1:8000/
```

The runnable app is at `docs/app.html`; the landing page is `docs/index.html`.

## Verify

Requires Node.js and npm.

```bash
npm install
npm run verify
```

Available checks:

```bash
npm run check:js
npm test
npm run verify
```

`npm run verify` runs JavaScript syntax checks and the procedure smoke tests in `tests/procedure-smoke.test.js`.

## Project layout

- `docs/index.html` — public landing page
- `docs/app.html` — runnable generator shell and form markup
- `docs/styles.css` — landing page and app styling
- `docs/sangeev-public-tokens.css` — shared public-estate design tokens
- `docs/theme.js` — local theme handling
- `docs/js/core.js` — shared DOM, state and formatting helpers
- `docs/js/note-formatters.js` — note section builders and formatting helpers
- `docs/js/procedures.js` — procedure-specific configuration and operation text generation
- `docs/js/app.js` — validation, rendering, event listeners and app initialisation
- `tests/procedure-smoke.test.js` — procedure wiring and generated-note regression tests
- `SPEC.md`, `PRODUCT.md`, `DESIGN.md` — project notes and behaviour/design rationale

## Deployment

The project is static and can be hosted by any static-site host. The current public deployment uses the files under `docs/`.

Suggested Cloudflare Pages settings:

- Framework preset: None
- Build command: blank
- Build output directory: `docs`

Do not deploy with analytics, backend storage or patient-data capture unless the safety and governance model is redesigned first.
