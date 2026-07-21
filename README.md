# Operation Note Generator

Browser-only operation-note drafting for common emergency general-surgery procedures, with an explicitly review-gated trauma-and-orthopaedics expansion in the current v2 source candidate.

The tool turns structured fields into a plain-text draft operation note. It does not use AI, call a backend, upload form contents, store clinical text or make clinical decisions.

Live project page: https://opnotes.sangeev.me

Live generator: https://opnotes.sangeev.me/app/

Source: https://github.com/Snowslash/op-note-gen

The repository keeps the React application source in `src/`, the retained v1 rollback source in `legacy-v1/` and the checked-in static deployment bundle in `docs/`.

## Procedure scope

The deployed parity set remains:

- laparoscopic appendicectomy
- laparoscopic cholecystectomy
- diagnostic laparoscopy +/- washout / adhesiolysis
- incision and drainage of abscess
- open inguinal hernia repair
- open umbilical hernia repair
- emergency laparotomy

The current undeployed v2 source candidate also includes:

- open reduction and internal fixation of ankle fracture
- hip hemiarthroplasty for fracture
- dynamic hip screw fixation
- cephalomedullary nail fixation
- open reduction and internal fixation of distal radius fracture

Ankle ORIF has completed synthetic generated-text clinical review. The other four T&O procedures are implemented against their approved form/data contracts but remain pending procedure-specific synthetic generated-text clinical review. All five remain undeployed; presence in source is not deployment approval.

Each listed procedure supports a full operation note, postoperative-plan-only output and ward handover summary.

## How to use it

1. Open the generator from the project page.
2. Choose the operation.
3. Complete core, operative and completion fields.
4. Select the output mode and generate the draft.
5. Review the plain-text output and any advisory warnings.
6. Confirm review before copying.

Do not enter patient-identifiable information into public pages or repositories. Any real clinical note remains the responsibility of the clinician using it.

## Privacy and safety boundary

- Runs entirely in the browser.
- No login, backend, database, analytics, AI or external API calls.
- No clinical text is written to browser storage, cookies or URLs.
- Clipboard access occurs only after generation and explicit review confirmation.
- The only persisted preference is the light/dark theme under the existing `sangeevSiteTheme` key.
- User-entered text is generated as plain text and rendered as React text content, never executable HTML.
- The seven legacy procedures retain their locked v1 omission/output behaviour. All five T&O candidates use the explicit blank-safe rules in `SPEC_TNO.md`.

This is a drafting aid, not decision support, clinical validation, local policy, consent checking or senior review.

## Run v2 locally

Requires Node.js and npm.

```bash
git clone https://github.com/Snowslash/op-note-gen.git
cd op-note-gen
npm ci
npm run dev
```

Use the local URL printed by Vite for the project page, then open `/app/` for the generator.

Build the static candidate:

```bash
npm run build
```

The output is written to `dist/`, with the project page at `dist/index.html` and the generator at `dist/app/index.html`. Security headers are copied from `public/_headers` and all runtime assets are self-hosted.

Build the checked-in static deployment bundle:

```bash
npm run build:pages
npm run test:pages
```

This writes the same project page and nested generator to `docs/`. GitHub Pages publishes `main:/docs`; the production Cloudflare Worker also deploys this directory using the checked-in `wrangler.jsonc` contract.

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
- `SPEC_TNO.md` — approved T&O architecture and five-procedure implementation contract; generated-text review remains pending for four procedures and deployment remains pending for all five

## Deployment and cutover

The application remains a static browser-only site. GitHub Pages publishes `main:/docs` as a secondary origin, while production `opnotes.sangeev.me` is the custom domain of the Cloudflare Worker named `op-note-gen`. A Git push updates the Pages source but does not update that Worker. After approval, run `npm run check:pages` and `npx wrangler deploy`; `wrangler.jsonc` deploys `docs/` and preserves the nested `/app/` route without changing DNS.

Keep `legacy-v1/` and the pre-cutover `main` commit available until the React deployment has passed a realistic synthetic browser smoke on both the GitHub Pages URL and the production custom domain.

Do not deploy the T&O candidate until each procedure's synthetic generated-text review and all remaining `SPEC_TNO.md` approval gates are explicitly completed.

Do not add analytics, backend storage or patient-data capture unless the safety and governance model is redesigned first.
