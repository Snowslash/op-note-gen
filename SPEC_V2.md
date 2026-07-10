# Operation Note Generator v2 Specification

Status: implementation complete; draft PR pending production cutover
Date: 2026-07-11
Owner: Sangeev

## 1. Purpose

Operation Note Generator v2 will migrate the current browser-only operative-note drafting utility from static HTML/CSS/vanilla JavaScript to the default house web stack:

```text
Vite + React + TypeScript + Tailwind CSS + shadcn/ui
```

The migration exists to improve maintainability, procedure-by-procedure testability and form workflow. It is not permission to broaden the product into a backend, clinical decision-support system, AI tool or patient-record system.

The current static application remains the production baseline until v2 meets every cutover gate in this specification.

## 2. Current v1 baseline

Current production URL:

- <https://opnotes.sangeev.me/>
- generator: <https://opnotes.sangeev.me/app.html>

Current repository state at specification time:

```text
repository: Snowslash/op-note-gen
Delphi checkout: /srv/projects/Op note gen
branch: main
baseline HEAD: 2d29e51c32a6424b7751a734f0abf1c8a6af1601
baseline subject: Use darker burgundy dark-mode accent
working tree before baseline repair: clean
```

The v1 baseline already provides:

- seven procedure templates;
- searchable procedure cards and an accessible semantic selector;
- grouped admin, clinical, operative and completion sections;
- conditional procedure fields;
- advisory warnings and required-field validation;
- generated-note preview;
- full-note, postoperative-plan and handover output modes;
- stale-draft invalidation after form changes;
- explicit review confirmation before copy;
- theme preference persistence only;
- desktop sticky preview and responsive single-column behaviour;
- no backend, analytics, external API or clinical-text persistence.

V2 must preserve those capabilities. Search, cards, warnings and preview are baseline behaviour, not new v2 features.

## 3. Product boundary

### V2 is

- a structured operative-note drafting aid;
- a browser-only static application;
- a typed and testable port of the existing rule-based generator;
- an improved guided form workflow;
- a clinician-reviewed starting point for a clinical record.

### V2 is not

- an electronic patient record;
- a data store;
- an AI writing or clinical-decision tool;
- a replacement for local policy, senior review or clinician judgement;
- a governance, regulatory or clinical-validation claim;
- an excuse to add accounts, sync, analytics or telemetry.

## 4. Non-negotiable privacy and safety constraints

- No backend or database.
- No analytics, telemetry or session replay.
- No external AI or API calls.
- No third-party runtime scripts.
- No transmission of form contents.
- No logging of entered clinical text.
- No autosave or localStorage persistence of clinical text.
- Theme may remain the only persisted preference.
- User-entered text must be rendered safely and never interpolated as executable HTML.
- Missing details must not become invented findings, complications, closure details, treatments or postoperative instructions.
- The generated draft must require clinician review before copying.
- Any form edit after generation must make the draft stale and disable copying until regeneration and renewed review confirmation.
- The production build must retain strict static-site security headers.

Visible wording must continue to make clear:

```text
Do not enter patient-identifiable information.
This tool runs entirely in your browser. No entered data is transmitted or stored by this site.
Review generated text carefully before use in any clinical record.
```

## 5. Supported procedures

V2 parity scope is exactly the current seven procedures:

1. Laparoscopic appendicectomy
2. Laparoscopic cholecystectomy
3. Diagnostic laparoscopy +/- washout / adhesiolysis
4. Incision and drainage of abscess
5. Open inguinal hernia repair
6. Open umbilical hernia repair
7. Emergency laparotomy

Do not add further procedures during the migration. New procedure requests belong after parity and cutover unless Sangeev explicitly changes the scope.

## 6. Required output modes

V2 must preserve:

- full operation note;
- postoperative plan only;
- ward handover summary.

For equivalent inputs, v2 output must remain byte-for-byte identical to the captured v1 parity fixtures unless an intentional wording change is separately reviewed and documented.

## 7. Interaction model

The recommended workflow is:

1. Procedure
2. Core details
3. Operative details
4. Completion
5. Review and copy

### 7.1 Procedure

- Searchable procedure picker.
- Unambiguous selected state.
- Full operation names, not unexplained abbreviations.
- Keyboard and screen-reader operable.
- Selection clears or isolates irrelevant procedure state so hidden values cannot leak into another procedure's output.

### 7.2 Core details

- Date/time, editable and initially filled using local `datetime-local` semantics.
- Surgeon, assistant, supervising consultant and anaesthetist.
- Anaesthetic.
- Additional team members.
- Indication and findings as required fields.

### 7.3 Operative details

- Render only the selected procedure's relevant fields.
- Keep procedure-specific wording and rules explicit in source code.
- Reveal conditional details immediately when their controlling answer changes.
- Clear hidden dependent values where the current v1 behaviour does so.
- Keep advisory warnings close enough to the affected workflow to be useful without implying automated clinical judgement.

### 7.4 Completion

- Specimen.
- Drain status/location.
- Estimated blood loss.
- Complications.
- Haemostasis and closure.
- Antibiotic prophylaxis.
- DVT prophylaxis.
- Postoperative care instructions.

### 7.5 Review and copy

- Show generated plain text in a readable preview.
- Preserve all three output modes.
- Show advisory warnings separately from the generated note.
- Require an explicit review checkbox before enabling copy.
- Editing the form or changing output mode must invalidate the prior review state as appropriate.
- Clipboard failure must leave the note visible and provide a plain fallback message.

Editing generated text inside the application is not part of the parity migration. It may be considered later only with a separate stale-state and review-safety design.

## 8. Responsive layout

### Desktop

- Compact workflow navigation.
- Central form workspace.
- Sticky review/output panel where viewport height permits.
- One clear primary action per stage.

### Mobile and narrow screens

- Single-column layout.
- No horizontal overflow.
- No drag, hover or sticky interaction required to complete the workflow.
- Procedure selection, form controls, generated output and copy gate remain fully usable.
- Primary actions should not depend on a right-handed layout.

## 9. Visual language

V2 must use shadcn/ui as owned component machinery, not as a default visual theme.

House direction:

- warm paper/ink palette;
- restrained burgundy accent;
- system-sans form UI;
- restrained Charter/Cambria-style serif headings where appropriate;
- thin rules and flat surfaces;
- near-square or lightly rounded controls;
- minimal or no shadows;
- no gradients, glow, glass, bento layout or generic medtech/SaaS presentation.

Canonical starting tokens:

```text
light background: #f4f0e8
light foreground: #1d1b18
light card:       #fbf8f2
light primary:    #8a1538
light border:     #c7b8a5
dark background:  #1d1b18
dark card:        #24211d
dark foreground:  #f4f0e8
dark primary:     #a3264d
dark hover/ring:  #c43b63
```

Use only the shadcn primitives that improve the workflow. Likely initial components:

- Button
- Input
- Textarea
- Label
- Select
- RadioGroup
- Checkbox
- Alert
- Collapsible
- Card, used sparingly

Do not turn every form section into card chrome or proliferate badges/pills.

## 10. Architecture

The clinical generation engine must remain independent of React.

Recommended structure:

```text
src/
  app/
    App.tsx
    AppShell.tsx
    workflow/
  components/
    ui/
    ProcedurePicker.tsx
    FormSection.tsx
    WarningSummary.tsx
    GeneratedNote.tsx
    ReviewCopyGate.tsx
  domain/
    types.ts
    procedures/
    generation.ts
    validation.ts
    warnings.ts
    fixtures/
  styles/
    globals.css
    tokens.css

tests/
  domain/
  parity/
  components/
  e2e/
```

React components collect typed values and present domain results. They must not own clinical wording rules.

Avoid building a universal medical-form framework. Shared field primitives are acceptable; procedure-specific inputs, warnings and generated wording must remain explicit and reviewable.

Use the smallest sufficient state model. Prefer React state/reducers and pure functions initially. Do not add React Hook Form, Zod or another state/form library unless a concrete tested problem justifies it.

## 11. Development and deployment isolation

V2 development should use the existing repository on an isolated branch/worktree:

```text
branch: feat/v2-react
suggested worktree: /srv/projects/op-note-gen-v2
```

Do not create a second unrelated source repository.

The production custom domain must continue serving v1 during migration. Use a Cloudflare branch-preview deployment or another clearly labelled preview URL for v2 review.

Do not implement a permanent production v1/v2 toggle. After cutover, retain a temporary rollback path through Cloudflare deployment history and, if useful, a short-lived `/classic/` static copy.

## 12. Test strategy

### 12.1 V1 parity fixtures

Before porting the domain engine, capture deterministic v1 input/output fixtures for:

- all seven procedures;
- full output mode for every procedure;
- postoperative-plan and handover modes;
- missing/unspecified values;
- `none`/`nil` complication handling;
- conditional details;
- stale unrelated procedure values;
- additional team members;
- date/time formatting.

### 12.2 Domain tests

Test pure functions for:

- generation;
- warning rules;
- validation;
- conditional visibility decisions where represented in the domain layer;
- absence and occurrence counts for clinically important shared lines;
- escaping boundaries where text reaches rendered UI.

### 12.3 Component tests

Test:

- procedure selection;
- conditional field rendering and clearing;
- required-field feedback;
- warning rendering;
- output-mode changes;
- stale-draft invalidation;
- review checkbox and copy-button state;
- clear-note versus clear-form behaviour;
- theme restoration.

### 12.4 Browser tests

At minimum, exercise:

```text
select procedure
→ enter synthetic details
→ generate
→ review
→ copy enabled
→ edit a form field
→ copy disabled and stale warning visible
→ regenerate
→ review again
```

Run at representative desktop and mobile viewport widths. Verify no horizontal overflow and no browser console errors.

## 13. Migration sequence

### Phase 0: Green v1 baseline

- Repair the stale cache-bust assertion.
- Run `npm run verify` and `git diff --check`.
- Record the exact baseline commit.
- Keep current live v1 unchanged.

### Phase 1: Capture parity fixtures

- Convert current representative smoke inputs into deterministic fixtures.
- Add a v1 parity-fixture check without changing generation behaviour.
- Commit separately from framework scaffolding.

### Phase 2: Scaffold v2

- Create `feat/v2-react` worktree.
- Add Vite, React, TypeScript, Tailwind, shadcn/ui, Vitest and React Testing Library.
- Add Playwright only for critical browser journeys.
- Preserve `_headers` in the built output.
- Establish the house token mapping before building feature UI.

### Phase 3: Port the pure domain engine

- Define typed procedure and form values.
- Port formatting, generation, validation and warning rules.
- Make parity fixtures pass before building the full UI.

### Phase 4: One complete vertical slice

Implement laparoscopic appendicectomy through the full workflow. Stop and compare v1/v2 behaviour and screenshots before porting more procedures.

### Phase 5: Remaining procedure parity

Port, test and review one procedure at a time:

1. laparoscopic cholecystectomy;
2. diagnostic laparoscopy;
3. incision and drainage;
4. open inguinal hernia repair;
5. open umbilical hernia repair;
6. emergency laparotomy.

### Phase 6: Candidate acceptance

- Production build.
- Checked-in GitHub Pages bundle generated under `docs/`.
- Desktop/mobile browser smoke.
- Security-header verification.
- Synthetic-data field test by Sangeev.

### Phase 7: Cutover

Only after every acceptance gate passes:

- merge the approved v2 branch;
- allow the existing GitHub Pages `main:/docs` source to publish the checked-in Vite bundle;
- verify the custom domain, generated-note journey, direct assets and security headers;
- preserve a tested rollback route.

## 14. Cutover acceptance gates

V2 must not replace v1 until all of the following are true:

- All seven procedures pass captured output parity.
- All three output modes pass.
- No stale hidden fields leak between procedures.
- Missing values do not become invented clinical assertions.
- Indication and findings requirements remain enforced.
- Advisory warnings remain non-decision-support prompts.
- User text is safely rendered.
- Changing form data invalidates the generated draft.
- Copy requires a fresh draft and explicit review confirmation.
- Clear note and clear form retain distinct predictable behaviour.
- No clinical text is stored, transmitted or logged.
- Production assets are self-hosted.
- CSP and other security headers pass.
- Desktop and mobile browser tests pass with no horizontal overflow.
- The design remains restrained, clinical and recognisably part of the Sangeev web estate.
- Sangeev has approved the preview after a realistic synthetic workflow trial.

## 15. Explicit non-goals for the migration

- New procedure templates.
- AI rewriting or shorthand interpretation.
- Clinical recommendations or risk scoring.
- Accounts, authentication or cloud sync.
- Backend form submission.
- EMR integration.
- PDF/Word export.
- Autosave.
- Shared/custom user templates.
- Analytics or telemetry.
- A generic clinical form-builder abstraction.
- Permanent support for two production implementations.

## 16. Immediate next decision

The React implementation and GitHub Pages bundle are complete on draft PR 2. Production remains on v1 until Sangeev explicitly authorises merging that PR. After merge, verify both the GitHub Pages URL and `opnotes.sangeev.me` with a realistic synthetic workflow, direct-asset checks and live security-header checks; revert the merge if those gates fail.
