# AGENTS.md

## Agent behaviour

- State assumptions when they materially affect implementation. Ask before choosing between genuinely different interpretations.
- Prefer the smallest change that satisfies the request; do not add speculative features, procedures, configurability or broad error handling.
- Make surgical edits and keep v1/v2 boundaries explicit.
- Define success criteria before substantial changes, then verify with the canonical gate before reporting completion.
- Do not commit, merge, deploy, change DNS/hosting or replace the production baseline unless explicitly authorised.

## Project shape

- `docs/` is the current no-build v1 production baseline. Treat it as frozen compatibility evidence during v2 work.
- `src/` is the Vite + React + TypeScript + Tailwind CSS + owned shadcn/ui v2 candidate.
- V2 builds to `dist/`; `public/_headers` supplies restrictive static-host security headers.
- There is no backend, API, analytics, AI layer, database or clinical-text persistence.
- `SPEC_V2.md` is authoritative for v2 architecture, workflow, design, safety and cutover gates.
- `README.md` describes local operation and the dual v1/v2 state.

## Running and verifying

```bash
npm ci
npm run dev
npm run check
```

`npm run check` is the canonical gate. It covers lint, v2 contracts, typed domain tests, React/component/accessibility tests, production build/dist assertions and the v1 smoke/parity suite.

For UI changes:

- check desktop and a real narrow viewport;
- confirm no horizontal overflow;
- verify keyboard/label semantics and generated-note review/copy gating;
- run `npm audit` when dependencies change.

## Clinical safety constraints

- Do not add AI rewriting, clinical inference or decision support.
- Preserve user-entered free text as plain text; never render it through executable HTML APIs.
- Missing values must remain omitted or `not specified` only where the locked v1 behaviour does that.
- Advisory warnings must remain separate and non-blocking.
- Generated text must be fresh and explicitly reviewed before copy is enabled.
- Clipboard failure must leave the draft visible and provide a manual-copy fallback.
- Never use real clinical data in tests, fixtures, screenshots, logs or commits.

## Privacy boundary

- No clinical text in localStorage, sessionStorage, IndexedDB, cookies, query strings, fragments or network requests.
- `src/app/theme.ts` is the sole localStorage/cookie exception and may persist only the `sangeevSiteTheme` light/dark preference.
- Runtime assets must be self-hosted; CSP retains `connect-src 'none'`.
- No third-party runtime scripts, analytics, remote fonts or external APIs.

## Code orientation

- `src/domain/` owns typed pure behaviour:
  - `generation.ts`, `validation.ts`, `warnings.ts`, `registry.ts`;
  - `procedures/*.ts` for operation-specific generation/warnings;
  - no DOM, browser storage or network APIs.
- `src/app/procedure-state.ts` creates blank discriminated inputs and owns UI-only review/control state.
- `src/app/procedure-form-definitions.ts` is the v2 UI field/option/visibility matrix for the seven supported procedures.
- `src/app/App.tsx` owns the five-stage workflow and fresh/reviewed/stale copy state machine.
- `src/components/ProcedureOperativeDetails.tsx` renders procedure-specific fields from the UI definitions.
- `src/components/CoreDetails.tsx` and `CompletionDetails.tsx` render shared stages.
- `tests/fixtures/v1/expected-output.json` is literal compatibility evidence. Tests must never recompute expected outputs with the implementation under test.

## Procedure changes

Current procedures are exactly:

- laparoscopic appendicectomy;
- laparoscopic cholecystectomy;
- diagnostic laparoscopy +/- washout / adhesiolysis;
- incision and drainage of abscess;
- open inguinal hernia repair;
- open umbilical hernia repair;
- emergency laparotomy.

Do not add another procedure without explicit approval. A legitimate procedure change must update together:

- domain type and per-procedure module;
- registry;
- UI form definition and visibility/clear rules;
- literal v1-compatible fixtures or an explicitly approved v2 behavioural decision;
- domain and React workflow tests;
- README/SPEC where the supported scope changes.

## Cutover

Passing tests is necessary but does not authorise deployment. Before cutover, preserve the existing v1 host/configuration for rollback and require explicit approval for the production build target, DNS/hosting changes, merge and cleanup of temporary worktrees/branches.
