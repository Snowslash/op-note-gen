# Operation Note Generator

Browser-only operation-note drafting for common emergency general-surgery procedures, with a clinically reviewed trauma-and-orthopaedics expansion in the deployed v2 release.

The tool turns structured fields into a plain-text draft operation note. It does not use AI, call a backend, upload form contents, store clinical text or make clinical decisions.

Live project page: https://opnotes.sangeev.me

Live generator: https://opnotes.sangeev.me/app/

Source: https://github.com/Snowslash/op-note-gen

The repository keeps the React application source in `src/`, the retained v1 rollback source in `legacy-v1/` and the checked-in static deployment bundle in `docs/`.

## Procedure scope

The deployed general-surgery parity set is:

- laparoscopic appendicectomy
- laparoscopic cholecystectomy
- diagnostic laparoscopy +/- washout / adhesiolysis
- incision and drainage of abscess
- open inguinal hernia repair
- open umbilical hernia repair
- emergency laparotomy

The deployed T&O expansion adds:

- open reduction and internal fixation of ankle fracture
- hip hemiarthroplasty for fracture
- dynamic hip screw fixation
- cephalomedullary nail fixation
- open reduction and internal fixation of distal radius fracture

All five T&O procedures completed form/data and synthetic generated-text clinical review before production deployment on 21 July 2026. Deployment status is verified separately from source presence.

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
- `SPEC_TNO.md` — approved T&O architecture and five-procedure implementation contract, with procedure-by-procedure clinical approval and the historical 21 July 2026 production release record

## Deployment and cutover

The application remains a static browser-only site. GitHub Pages publishes `main:/docs` as a secondary origin, while production `opnotes.sangeev.me` is the custom domain of the Cloudflare Worker named `op-note-gen`. The existing Cloudflare Git integration runs **Workers Builds: op-note-gen** when `main` is pushed, independently of the checks-only GitHub Actions workflow. Treat a push to `main` as a production release, not just source publication.

Before an authorised release, run `npm run check:pages` and include the reviewed `docs/` output. After pushing, verify the exact commit's GitHub Checks, Workers Builds and GitHub Pages results, then verify the landing page and `/app/` on both hosting origins. A successful build alone is not live-route acceptance.

Use `npx wrangler deploy` only for a separately authorised manual deployment when the Git-triggered path cannot be used. Check for an automatic build in progress first; do not upload the same release twice. Both paths use `wrangler.jsonc` to publish `docs/` without changing DNS.

Keep `legacy-v1/` and the pre-cutover `main` commit available until the React deployment has passed a realistic synthetic browser smoke on both the GitHub Pages URL and the production custom domain.

The five-procedure T&O release was approved and deployed on 21 July 2026, as recorded in `SPEC_TNO.md` sections 12 and 14. That historical approval does not authorise fresh clinical-content changes or another deployment: future procedure/template changes require the relevant explicit clinical review and separate release authorisation under the `SPEC_TNO.md` gates.

Do not add analytics, backend storage or patient-data capture unless the safety and governance model is redesigned first.

## Licence

Original project code is licensed under the [MIT License](LICENSE), copyright © 2026 Sangeev Ravimohan.

Third-party dependencies and bundled assets retain their own licences. Notices for the shared estate UI and bundled fonts are preserved in [`public/licenses/`](public/licenses/) and copied into the static build's `licenses/` directory alongside the project's MIT licence. The clinical safety boundaries above remain unchanged.

## Desk landing verification

The public landing uses the reviewed `ProjectPage.tsx` and `project-page.css`
template with project-specific copy in `project.ts`. Keep the template copies
identical to the [canonical project-page source](https://github.com/Snowslash/sangeev-me/tree/main/project-pages); the estate UI dependency
continues to own shared chrome and tokens, not this page body. The initial HTML
keeps the introduction, safety boundaries and real destinations available without
JavaScript. The application source and estate archive pin are unchanged; the
separately authorised dependency-security refresh is recorded below.

Using Node 22.23+ within Node 22, install from the lockfile with `npm ci`, then run:

```sh
npm run lint
npm run test:contract
npm run test:domain
npx vitest run --maxWorkers=1
npm run build
npm run test:dist
npm run test:v1
npm run build:pages
npm run test:pages
LANDING_BUILT=dist,docs node --test tests/landing-copy.contract.mjs tests/landing-motion.contract.mjs
```

The landing tests use Node's type stripping, not the TypeScript compiler API. They
check literal reviewed copy, initial/emitted HTML and the actual screenshot hook's
completion, cancellation, fallback, reduced-motion and same-print reopen lifecycle.
They simulate DOM/time/scheduling; real focus, inertness and animation appearance
still require browser acceptance. Run these additional contracts alongside the
native checks above; they are not implicitly included in `npm test`.

Local preparation on 15 October 2026 passed 3 scaffold contracts, 47 domain tests, 108 Vitest tests, 4 dist checks, v1 smoke/parity, 5 Pages checks and 10 landing copy/lifecycle checks.
The expanded sequence above fulfils `check:pages` with a single Vitest worker. This is local build verification, not a new deployment claim.
The inherited 6 audit findings (4 high, 2 moderate) were resolved by the compatible
lockfile refresh in [RELEASE-SECURITY.md](RELEASE-SECURITY.md). Fresh locked installs
and full/production-filtered audits report zero findings. Rendered browser and
live deployment acceptance remain separate gates.
