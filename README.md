# Operation Note Generator

Browser-only operation-note drafting for common emergency general-surgery procedures.

The tool turns structured fields into a plain-text draft operation note. It does not use AI, call a backend, upload form contents, store clinical text or make clinical decisions.

Live project page: https://opnotes.sangeev.me

Source: https://github.com/Snowslash/op-note-gen

The repository keeps the React application source in `src/`, the retained v1 rollback source in `legacy-v1/` and the GitHub Pages deployment bundle in `docs/`.

## Supported procedures

- laparoscopic appendicectomy
- laparoscopic cholecystectomy
- diagnostic laparoscopy +/- washout / adhesiolysis
- incision and drainage of abscess
- open inguinal hernia repair
- open umbilical hernia repair
- emergency laparotomy

Each procedure supports a full operation note, postoperative-plan-only output and ward handover summary.

## How to use it

1. Choose the operation.
2. Complete core, operative and completion fields.
3. Select the output mode and generate the draft.
4. Review the plain-text output and any advisory warnings.
5. Confirm review before copying.

Do not enter patient-identifiable information into public pages or repositories. Any real clinical note remains the responsibility of the clinician using it.

## Privacy and safety boundary

- Runs entirely in the browser.
- No login, backend, database, analytics, AI or external API calls.
- No clinical text is written to browser storage, cookies or URLs.
- Clipboard access occurs only after generation and explicit review confirmation.
- The only persisted preference is the light/dark theme under the existing `sangeevSiteTheme` key.
- User-entered text is generated as plain text and rendered as React text content, never executable HTML.
- Missing details remain omitted or `not specified` according to the locked v1 behaviour.

This is a drafting aid, not decision support, clinical validation, local policy, consent checking or senior review.

## Run v2 locally

Requires Node.js and npm.

```bash
git clone https://github.com/Snowslash/op-note-gen.git
cd op-note-gen
npm ci
npm run dev
```

Use the local URL printed by Vite.

Build the static candidate:

```bash
npm run build
```

The output is written to `dist/`. Security headers are copied from `public/_headers` and all runtime assets are self-hosted.

Build the checked-in GitHub Pages bundle:

```bash
npm run build:pages
npm run test:pages
```

This writes the same self-hosted application to `docs/`, preserving the existing GitHub Pages source contract used by `opnotes.sangeev.me`.

## Verify

The canonical gate is:

```bash
npm run check
```

It runs:

- Oxlint over v2 source;
- v2 scaffold/privacy contracts;
- type-checked pure-domain tests;
- React component, workflow, accessibility and privacy tests;
- the production Vite build and `dist/` assertions;
- v1 JavaScript syntax, smoke and literal parity tests.

Additional useful commands:

```bash
npm run test:domain
npm run test:v1
npm run build
npm audit
```

The checked-in v1 fixture set covers all seven procedures in all three output modes. Both the pure domain engine and React review stage are compared byte-for-byte against those literal outputs.

## Project layout

- `src/app/` — React workflow state, theme boundary and procedure form definitions
- `src/components/` — shared workflow, form, generated-note and owned shadcn/ui components
- `src/domain/` — typed pure generation, validation, warnings, registry and per-procedure modules
- `src/styles/` — Tailwind entry and warm paper/ink/burgundy design tokens
- `public/_headers` — static-host security headers and restrictive CSP
- `tests/components/` — React journeys, all-procedure parity, accessibility, theme and privacy tests
- `tests/domain/` — typed domain parity, warning and validation tests
- `tests/fixtures/v1/` — deterministic synthetic v1 inputs and literal outputs
- `docs/` — generated GitHub Pages deployment bundle for the React application
- `legacy-v1/` — retained static v1 source for rollback and parity testing
- `SPEC_V2.md` — v2 architecture, safety, design and cutover contract

## Deployment and cutover

The application remains a static browser-only site. GitHub Pages currently publishes `main:/docs`; `opnotes.sangeev.me` is Cloudflare-proxied to that deployment. Pushing this feature branch does not alter production. Merging the verified branch into `main` publishes the React bundle through the existing GitHub Pages source while preserving the current domain and DNS path.

Keep `legacy-v1/` and the pre-cutover `main` commit available until the React deployment has passed a realistic synthetic browser smoke on both the GitHub Pages URL and the production custom domain.

Do not add analytics, backend storage or patient-data capture unless the safety and governance model is redesigned first.
