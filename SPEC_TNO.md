# Trauma and Orthopaedics Clinical Content Contract

Status: all five T&O form/data contracts approved and implemented in the undeployed v2 candidate; ankle ORIF generated text approved; remaining generated-text previews and deployment pending
Date: 2026-07-20
Owner and clinical approver: Sangeev
Drafted by: Hermes from the approved product scope, the current repository behaviour and the primary sources in section 15

Implementation target: the Vite + React + TypeScript v2 application in `src/`. `legacy-v1/` remains unchanged rollback and parity evidence.

## 1. Purpose

This specification defines the first trauma and orthopaedics expansion of the browser-only Operation Note Generator.

It fixes the proposed field names, form controls, dependency rules, generated-note labels, advisory warnings and review gates before production code is changed. The clinical wording remains a draft until Sangeev explicitly approves it procedure by procedure.

The expansion must preserve the existing seven general-surgery procedures and all captured output-parity fixtures.

## 2. Approved product scope

The trauma-first roadmap is:

1. Open reduction and internal fixation of ankle fracture (`ankle-orif`)
2. Hip hemiarthroplasty for fracture (`hip-hemiarthroplasty`)
3. Dynamic hip screw fixation (`dynamic-hip-screw`)
4. Cephalomedullary nail fixation (`cephalomedullary-nail`)
5. Open reduction and internal fixation of distal radius fracture (`distal-radius-orif`)

The shared T&O model and all five procedure form/data contracts are approved and implemented in the undeployed v2 candidate. Ankle ORIF has completed generated-text review; the other four procedure templates still require procedure-specific synthetic generated-text review before deployment.

Implementation order:

1. shared specialty metadata and T&O completion model;
2. ankle ORIF as the first complete vertical slice;
3. clinical review of the ankle ORIF synthetic outputs;
4. one remaining procedure at a time, each behind its own clinical-review gate.

Out of scope for this release:

- total hip replacement and total knee replacement;
- hip-fracture total hip arthroplasty;
- arthroscopy;
- spinal surgery;
- paediatric orthopaedics;
- tumour surgery;
- open-fracture debridement and fixation pathways;
- pilon fractures;
- external fixation as a standalone procedure;
- revision arthroplasty;
- prosthetic joint infection procedures;
- decision support, implant selection or treatment recommendations.

The first-release procedures are single-side workflows. Bilateral cases are not represented by one generated note in this version.

## 3. Safety and product boundary

The T&O expansion remains:

- a structured drafting aid;
- a static browser-only application;
- a rule-based generator with explicit, clinician-reviewed wording;
- a starting point that must be reviewed and edited in the clinical record.

It is not:

- an electronic patient record;
- a complete legal record on its own;
- a substitute for the theatre implant log, implant stickers, the National Joint Registry or another required registry;
- a prescribing tool;
- a fracture-classification tool;
- a clinical checklist or wrong-site prevention system;
- a recommendation engine for fixation, weight-bearing, thromboprophylaxis, antibiotics, imaging or follow-up;
- a substitute for local Cardiff and Vale University Health Board policy or senior clinical judgement.

The app must continue to display a prominent instruction not to enter patient-identifiable information. Free-text entry cannot technically prevent a user typing identifiers, so the enforceable privacy contract is that the app stores, transmits and logs no form data. The copied draft is intended to be inserted into the correct patient record, where patient identifiers and the author's signature/e-signature are managed by the clinical system. The generator must not imply that its draft alone satisfies the complete record-keeping standard.

## 4. Evidence translated into product requirements

The evidence in section 15 supports the following documentation prompts, not clinical defaults.

### 4.1 RCS England Good Surgical Practice 2025

The full operation note must be capable of recording:

- date and time;
- elective or non-elective status;
- operating surgeon, assistant and anaesthetist;
- procedure, incision, diagnosis and findings;
- problems or complications;
- additional procedures and their reasons;
- tissue removed, added or altered;
- prostheses and implanted materials, including identifiers;
- closure technique;
- estimated blood loss;
- antibiotic and thromboprophylaxis details where applicable;
- detailed postoperative instructions.

The app does not generate a signature. The user must sign or e-sign the final entry in the clinical record.

### 4.2 BOAST: Management of Ankle Fractures

For ankle fracture fixation, the draft should provide places to record:

- fracture pattern and operative findings;
- reduction and stabilisation of the ankle mortise;
- syndesmosis assessment and stabilisation when performed;
- intraoperative imaging and the recorded result;
- explicit loading or weight-bearing instructions;
- immobilisation, follow-up and postoperative imaging plans;
- a thromboprophylaxis plan entered by the user.

BOAST refers to local thromboprophylaxis arrangements, but this specification has not verified or encoded a Cardiff and Vale protocol. The generator must not default these entries to a clinically preferred answer or claim local-policy compliance.

### 4.3 NICE CG124: Hip fracture management

For hip-fracture procedures, the draft should provide places to record:

- the actual procedure and implant fixation used;
- approach for hemiarthroplasty;
- loading or weight-bearing instructions;
- mobilisation and rehabilitation instructions.

NICE recommendations must not be converted into automatic assertions. In particular, the generator must not auto-fill cemented fixation, full weight-bearing, implant choice or approach.

## 5. Metadata and picker contract

Every procedure definition will gain explicit metadata:

```ts
type SurgicalSpecialty = "general-surgery" | "trauma-orthopaedics";
type CompletionProfile = "general-surgery" | "orthopaedics";

interface ProcedureDefinition {
  id: ProcedureId;
  label: string;
  specialty: SurgicalSpecialty;
  category: string;
  keywords: readonly string[];
  completionProfile: CompletionProfile;
  supportedOutputModes: readonly OutputMode[];
}
```

New procedure metadata:

| ID | Visible label | Category | Search keywords |
| --- | --- | --- | --- |
| `ankle-orif` | Open reduction and internal fixation of ankle fracture | Lower-limb trauma | ankle, fracture, ORIF, malleolus, syndesmosis |
| `hip-hemiarthroplasty` | Hip hemiarthroplasty for fracture | Hip-fracture surgery | hip, hemiarthroplasty, hemi, neck of femur, NOF |
| `dynamic-hip-screw` | Dynamic hip screw fixation | Hip-fracture surgery | hip, DHS, sliding hip screw, trochanteric fracture |
| `cephalomedullary-nail` | Cephalomedullary nail fixation | Hip-fracture surgery | hip, nail, CMN, IM nail, cephalomedullary, subtrochanteric |
| `distal-radius-orif` | Open reduction and internal fixation of distal radius fracture | Upper-limb trauma | wrist, distal radius, fracture, ORIF, volar plate |

The picker must show two groups: `General surgery` and `Trauma and orthopaedics`. Search must match label, category and keywords. Abbreviations may be search keywords but should not replace full visible procedure names.

## 6. Shared T&O data contract

The current `CommonProcedureInput` contains general-surgery-specific concepts. Implementation should split it into a genuinely shared base, the unchanged general-surgery completion model and the following T&O model.

### 6.1 Existing shared fields retained

The following existing values remain shared:

- `operationDateTime` — Date/time — editable local `datetime-local` value; blank by default for every new T&O input. Existing general-surgery timestamp behaviour remains unchanged for output parity. The T&O app must not silently substitute form-open time for operation time.
- `surgeon` — Surgeon;
- `assistant` — Assistant;
- `supervisingConsultant` — Supervising consultant;
- `anaesthetic` — Anaesthetic;
- `anaesthetist` — Anaesthetist;
- `indication` — Indication — required;
- `findings` — Findings — required;
- `bloodLoss` — Estimated blood loss;
- `complications` — Complications;
- `antibioticProphylaxis` — Antibiotic prophylaxis;
- `dvtProphylaxis` — DVT prophylaxis;
- `postOpPlan` — Other post-operative instructions;
- `additionalOperativeDetails` — Additional operative details;
- `additionalTeamMembers` — Additional team members.

Existing general-surgery output must remain byte-for-byte unchanged.

### 6.2 New shared T&O fields

Each entry below gives the domain field, visible label, control and exact options where applicable.

- `caseClassification` — `Case classification` — select — `Elective`, `Non-elective`; no default.
- `side` — `Side` — radio — `Right`, `Left`; proposed blocking validation.
- `operativeDiagnosis` — `Operative diagnosis` — textarea; no default.
- `positionAndTableSetup` — `Position / table set-up` — select-custom — `Supine`, `Lateral decubitus`, `Supine on traction table`; custom value allowed; no default.
- `tourniquetUsed` — `Tourniquet used` — radio — `yes`, `no`, `not applicable`; no default.
- `tourniquetSite` — `Tourniquet site` — text; shown only when `tourniquetUsed = yes`.
- `tourniquetPressure` — `Tourniquet pressure` — text; shown only when `tourniquetUsed = yes`.
- `tourniquetDuration` — `Tourniquet duration` — text; shown only when `tourniquetUsed = yes`.
- `imageIntensifierUsed` — `Image intensifier used` — radio — `yes`, `no`, `not applicable`; no default.
- `finalImagingFindings` — `Final intraoperative imaging findings` — textarea; shown only when `imageIntensifierUsed = yes`.
- `additionalProcedurePerformed` — `Additional procedure performed` — radio — `yes`, `no`; no default.
- `additionalProcedureDetails` — `Additional procedure details` — textarea; shown only when `additionalProcedurePerformed = yes`.
- `additionalProcedureReason` — `Reason for additional procedure` — textarea; shown only when `additionalProcedurePerformed = yes`.
- `specimensOrSamples` — `Specimens / samples` — textarea; optional and not pre-filled.
- `tissueDetails` — `Tissue removed, added or altered` — textarea; optional.
- `implantsUsed` — `Implants used` — radio — `yes`, `no`; no default.
- `implants` — repeatable structured implant rows; shown only when `implantsUsed = yes`.
- `haemostasisDetails` — `Haemostasis details` — textarea; optional and not pre-filled.
- `closureDetails` — `Closure details` — textarea.
- `dressingAndImmobilisation` — `Dressing / immobilisation` — textarea.
- `loadingInstructions` — `Loading / weight-bearing instructions` — textarea; no default.
- `postoperativeMonitoring` — `Post-operative monitoring / checks` — textarea; no default.
- `postoperativeImaging` — `Post-operative imaging` — textarea; no default.
- `woundCare` — `Wound care` — textarea; no default.
- `followUp` — `Follow-up` — textarea; no default.
- `rehabilitationPlan` — `Physiotherapy / rehabilitation plan` — textarea; no default.

`loadingInstructions` is deliberately free text. The application must not choose or infer full, partial, heel or non-weight-bearing status.

### 6.3 Structured implant rows

Each implant row contains:

```ts
interface ImplantRecord {
  id: string;
  component: string;
  manufacturer: string;
  productOrSystem: string;
  size: string;
  lotSerialOrReference: string;
}
```

Visible labels:

- `Component`;
- `Manufacturer`;
- `Product / system`;
- `Size`;
- `Lot / serial / reference number`.

Rules:

- rows are manually added and removed;
- no row is pre-populated;
- one row should represent one component or one clinically sensible group of identical components;
- an entered identifier is copied verbatim;
- the app does not validate an identifier against an implant database;
- the app does not claim that an implant record is complete;
- choosing `Implants used: no` hides and clears implant rows, following the existing dependent-field clearing model;
- the final record must still use the organisation's required implant-traceability workflow.

Implant-row semantics:

- a row is empty only when all five user-entered attributes are blank after trimming;
- all-empty rows are omitted from generated output and do not count as an implant record;
- `Implants used: yes` with only empty rows is treated as having no implant rows and triggers the existing no-details warning;
- a partially completed row remains in output with only its entered attributes; missing component and identifier warnings are emitted in that order for each row, following visible row order;
- adding, editing, removing or reordering a row invalidates the generated draft and its review confirmation;
- each row has a stable UI-only ID created using the same collision-resistant pattern as `TeamMember.id`; the ID is never printed;
- implant rows require a dedicated typed repeatable-row component and array-aware state update/clear functions. They must not be cast through the existing `Record<string, string | boolean>` generic operative-field renderer.

## 7. Procedure-specific clinical fields

All select and radio controls start unanswered. No procedure-specific finding is pre-filled.

### 7.1 Ankle ORIF

Procedure ID: `ankle-orif`

Visible hint:

```text
Record the fracture pattern, reduction, malleolar fixation, syndesmosis assessment, imaging and postoperative restrictions. Blank fields remain not specified.
```

Fields:

- `ankleFracturePattern` — `Fracture pattern` — textarea.
- `ankleApproachAndIncision` — `Approach / incision` — textarea.
- `ankleReductionMethod` — `Reduction method` — select-custom — `Closed reduction`, `Open reduction`, `Combined closed and open reduction`; custom value allowed.
- `ankleReductionDetails` — `Reduction details` — textarea.
- `fibularFixationPerformed` — `Fibular fixation performed` — radio — `yes`, `no`, `not applicable`.
- `fibularFixationDetails` — `Fibular fixation details` — textarea; shown only when `fibularFixationPerformed = yes`.
- `medialMalleolusFixationPerformed` — `Medial malleolus fixation performed` — radio — `yes`, `no`, `not applicable`.
- `medialMalleolusFixationDetails` — `Medial malleolus fixation details` — textarea; shown only when `medialMalleolusFixationPerformed = yes`.
- `posteriorMalleolusFixationPerformed` — `Posterior malleolus fixation performed` — radio — `yes`, `no`, `not applicable`.
- `posteriorMalleolusFixationDetails` — `Posterior malleolus fixation details` — textarea; shown only when `posteriorMalleolusFixationPerformed = yes`.
- `syndesmosisAssessed` — `Syndesmosis assessed` — radio — `yes`, `no`.
- `syndesmosisAssessmentDetails` — `Syndesmosis assessment method and findings` — textarea; shown only when `syndesmosisAssessed = yes`.
- `syndesmosisStabilised` — `Syndesmosis stabilised` — radio — `yes`, `no`; shown only when `syndesmosisAssessed = yes`.
- `syndesmosisFixationDetails` — `Syndesmosis fixation details` — textarea; shown only when `syndesmosisStabilised = yes`.
- `ankleIrrigationDetails` — `Irrigation details` — textarea; optional.

The shared `finalImagingFindings` field records the user's own description of reduction, mortise alignment and implant position. The app must not generate `satisfactory`, `anatomical`, `stable` or similar findings unless entered by the user.

### 7.2 Hip hemiarthroplasty for fracture

Procedure ID: `hip-hemiarthroplasty`

Visible hint:

```text
Record the approach, femoral-head excision, canal preparation, fixation, implants, reduction, stability and postoperative plan. No implant or weight-bearing detail is assumed.
```

Fields:

- `hemiApproach` — `Surgical approach` — select-custom — `Anterolateral`, `Direct lateral`, `Posterior`; custom value allowed.
- `hemiApproachAndIncisionDetails` — `Approach / incision details` — textarea.
- `hemiCapsuleManagement` — `Capsule management` — textarea.
- `hemiFemoralHeadExcision` — `Femoral head excision details` — textarea.
- `hemiNativeHeadSize` — `Native femoral head size` — text.
- `hemiCanalPreparation` — `Femoral canal preparation` — textarea.
- `hemiStemFixation` — `Stem fixation` — radio — `Cemented`, `Uncemented`; no default.
- `hemiCementDetails` — `Cement and cementing details` — textarea; shown only when `hemiStemFixation = Cemented`.
- `hemiTrialAndReduction` — `Trial and reduction details` — textarea.
- `hemiStabilityAssessment` — `Stability assessment` — textarea.
- `hemiLegLengthAndOffset` — `Leg length / offset assessment` — textarea.
- `hemiCapsuleAndAbductorRepair` — `Capsule / abductor repair` — textarea.

The implant rows record the stem, head and cement-related products as applicable. Cemented fixation, approach and postoperative loading must not be preselected from guideline recommendations.

### 7.3 Dynamic hip screw fixation

Procedure ID: `dynamic-hip-screw`

Visible hint:

```text
Record the fracture pattern, reduction, approach, guidewire and lag-screw placement, plate fixation, imaging and postoperative plan.
```

Fields:

- `dhsFracturePattern` — `Fracture pattern` — textarea.
- `dhsReductionMethod` — `Reduction method` — select-custom — `Closed reduction`, `Open reduction`, `Combined closed and open reduction`; custom value allowed.
- `dhsReductionDetails` — `Reduction details` — textarea.
- `dhsApproachAndIncision` — `Approach / incision` — textarea.
- `dhsGuidewireAndLagScrewDetails` — `Guidewire and lag-screw placement` — textarea.
- `dhsPlateFixationDetails` — `Side-plate and screw fixation` — textarea.
- `dhsCompressionApplied` — `Compression applied` — radio — `yes`, `no`, `not applicable`; no default.
- `dhsIrrigationDetails` — `Irrigation details` — textarea; optional.

The shared implant rows record the lag screw, plate and other implanted materials. The shared final-imaging field records the user's own assessment; no image finding is inferred.

### 7.4 Cephalomedullary nail fixation

Procedure ID: `cephalomedullary-nail`

Visible hint:

```text
Record the fracture pattern, reduction, entry point, nail insertion, proximal fixation, distal locking, imaging and postoperative plan.
```

Fields:

- `cmnFracturePattern` — `Fracture pattern` — textarea.
- `cmnReductionMethod` — `Reduction method` — select-custom — `Closed reduction`, `Open reduction`, `Combined closed and open reduction`; custom value allowed.
- `cmnReductionDetails` — `Reduction details` — textarea.
- `cmnEntryPointAndIncision` — `Entry point / approach / incision` — textarea.
- `cmnCanalPreparation` — `Canal preparation` — textarea.
- `cmnNailInsertionDetails` — `Nail insertion details` — textarea.
- `cmnProximalFixationDetails` — `Proximal fixation details` — textarea.
- `cmnDistalLockingPerformed` — `Distal locking performed` — radio — `yes`, `no`, `not applicable`.
- `cmnDistalLockingDetails` — `Distal locking details` — textarea; shown only when `cmnDistalLockingPerformed = yes`.
- `cmnCompressionApplied` — `Compression applied` — radio — `yes`, `no`, `not applicable`; no default.
- `cmnIrrigationDetails` — `Irrigation details` — textarea; optional.

The shared implant rows record the nail, proximal fixation and distal locking implants. Nail length, diameter and other product details are user-entered, not calculated.

### 7.5 Distal radius ORIF

Procedure ID: `distal-radius-orif`

Visible hint:

```text
Record the fracture pattern, approach, reduction, plate and screw fixation, distal radioulnar joint assessment, imaging and postoperative restrictions.
```

Fields:

- `distalRadiusFracturePattern` — `Fracture pattern` — textarea.
- `distalRadiusApproach` — `Surgical approach` — select-custom — `Volar`, `Dorsal`, `Combined volar and dorsal`; custom value allowed.
- `distalRadiusApproachAndIncision` — `Approach / incision details` — textarea.
- `distalRadiusReductionDetails` — `Reduction details` — textarea.
- `distalRadiusFixationDetails` — `Plate and screw fixation details` — textarea.
- `distalRadiusDrujAssessed` — `Distal radioulnar joint assessed` — radio — `yes`, `no`.
- `distalRadiusDrujDetails` — `Distal radioulnar joint assessment findings` — textarea; shown only when `distalRadiusDrujAssessed = yes`.
- `distalRadiusTendonAssessment` — `Tendon assessment` — textarea; optional.
- `distalRadiusIrrigationDetails` — `Irrigation details` — textarea; optional.

A carpal tunnel release or another extra procedure must use the shared additional-procedure fields, including the reason. The app must not infer an acceptable reduction, screw position or joint stability.

## 8. Dependency and stale-data rules

The following transitions must clear hidden dependent data immediately:

- `tourniquetUsed != yes` clears `tourniquetSite`, `tourniquetPressure` and `tourniquetDuration`;
- `imageIntensifierUsed != yes` clears `finalImagingFindings`;
- `additionalProcedurePerformed != yes` clears `additionalProcedureDetails` and `additionalProcedureReason`;
- `implantsUsed != yes` clears all implant rows;
- each malleolar fixation status other than `yes` clears its matching fixation-details field;
- `syndesmosisAssessed != yes` clears assessment details, stabilisation status and fixation details;
- `syndesmosisStabilised != yes` clears syndesmosis fixation details;
- `hemiStemFixation != Cemented` clears `hemiCementDetails`;
- `cmnDistalLockingPerformed != yes` clears `cmnDistalLockingDetails`;
- `distalRadiusDrujAssessed != yes` clears `distalRadiusDrujDetails`.

Changing procedure must reset the entire `ProcedureInput`, including all shared T&O values and implant rows, to the new procedure's defaults. It must also reset custom-control state, validation errors, draft text and warnings, review confirmation, feedback and output mode. There is no carry-forward workflow in this release. No value from a previous procedure may appear in the new form or output.

Any edit after generation must continue to stale the draft and revoke copy approval until regeneration and renewed review confirmation.

## 9. Generated-note contract

All three existing modes remain supported.

### 9.1 Missing-value semantics

- blank structured values render as `not specified` where the field has a fixed full-note line;
- optional conditional detail lines are omitted when their controlling answer is explicitly `no` or `not applicable`;
- an unanswered controlling field renders as `not specified` and does not reveal dependent details;
- explicit `no` and `not applicable` remain explicit;
- user text is trimmed but otherwise preserved;
- no adjective, measurement, finding, restriction or clinical plan is invented;
- user-entered text must be rendered as text, never executable HTML.

### 9.2 Full-note section order

```text
Procedure
Date/time
Case classification
Side
Surgeon / Assistant
Additional team members
Supervising consultant
Anaesthetic
Anaesthetist
Indication
Operative diagnosis
Findings
Position / table set-up
Operation
Specimens / samples
Implants
Tissue removed, added or altered
Estimated blood loss
Complications
Haemostasis
Closure
Post-operative plan
```

Shared T&O controller output is literal and state-specific. Within the `Operation` block, the order is: tourniquet lines, procedure-specific operation lines, image-intensifier lines, then additional-procedure lines.

```text
tourniquetUsed = yes:
Tourniquet used: yes
Tourniquet details: Site <value or not specified>; pressure <value or not specified>; duration <value or not specified>

tourniquetUsed = no | not applicable | unanswered:
Tourniquet used: <no | not applicable | not specified>

imageIntensifierUsed = yes:
Image intensifier used: yes
Final intraoperative imaging: <value or not specified>

imageIntensifierUsed = no | not applicable | unanswered:
Image intensifier used: <no | not applicable | not specified>

additionalProcedurePerformed = yes:
Additional procedure performed: yes
Additional procedure: <value or not specified>
Reason for additional procedure: <value or not specified>

additionalProcedurePerformed = no | unanswered:
Additional procedure performed: <no | not specified>
```

`Operative diagnosis: <value>` appears as its own full-note block between indication and findings.

`Specimens / samples: <value>` and `Haemostasis: <value>` are fixed full-note lines using the missing-value semantics in section 9.1. Neither field implies that a specimen was sent or that haemostasis was confirmed unless the user enters that information.

The detail lines in each `yes` branch are absent for every other controller state. All non-conditional procedure-specific lines in sections 9.3 to 9.7 remain present in the full note and render blank values as `not specified`. Marking a field `optional` means it has no blocking validation or blank-field warning; it does not change this literal full-note output rule.

Implants output:

```text
Implants:
1. Component: <value>; manufacturer: <value>; product / system: <value>; size: <value>; lot / serial / reference: <value>
2. ...
```

Blank attributes within a non-empty row are omitted rather than converted into assertions. If implant use is answered `yes` but there is no non-empty row, output `Implants: not specified` and show an advisory warning. If answered `no`, output `Implants used: no`. If unanswered, output `Implants: not specified`.

Post-operative plan lines:

```text
Antibiotic prophylaxis: <value>
DVT prophylaxis: <value>
Loading / weight-bearing instructions: <value>
Post-operative monitoring / checks: <value>
Post-operative imaging: <value>
Dressing / immobilisation: <value>
Wound care: <value>
Physiotherapy / rehabilitation plan: <value>
Follow-up: <value>
Other post-operative instructions: <value>
```

### 9.3 Ankle ORIF operation block

```text
Fracture pattern: <value>
Approach / incision: <value>
Reduction method: <value>
Reduction details: <value>
Fibular fixation performed: <value>
Fibular fixation details: <value>
Medial malleolus fixation performed: <value>
Medial malleolus fixation details: <value>
Posterior malleolus fixation performed: <value>
Posterior malleolus fixation details: <value>
Syndesmosis assessed: <value>
Syndesmosis assessment: <value>
Syndesmosis stabilised: <value>
Syndesmosis fixation: <value>
Irrigation: <value>
Additional operative details: <value>
```

### 9.4 Hip hemiarthroplasty operation block

```text
Surgical approach: <value>
Approach / incision details: <value>
Capsule management: <value>
Femoral head excision: <value>
Native femoral head size: <value>
Femoral canal preparation: <value>
Stem fixation: <value>
Cement and cementing details: <value>
Trial and reduction: <value>
Stability assessment: <value>
Leg length / offset assessment: <value>
Capsule / abductor repair: <value>
Additional operative details: <value>
```

### 9.5 Dynamic hip screw operation block

```text
Fracture pattern: <value>
Reduction method: <value>
Reduction details: <value>
Approach / incision: <value>
Guidewire and lag-screw placement: <value>
Side-plate and screw fixation: <value>
Compression applied: <value>
Irrigation: <value>
Additional operative details: <value>
```

### 9.6 Cephalomedullary nail operation block

```text
Fracture pattern: <value>
Reduction method: <value>
Reduction details: <value>
Entry point / approach / incision: <value>
Canal preparation: <value>
Nail insertion: <value>
Proximal fixation: <value>
Distal locking performed: <value>
Distal locking details: <value>
Compression applied: <value>
Irrigation: <value>
Additional operative details: <value>
```

### 9.7 Distal radius ORIF operation block

```text
Fracture pattern: <value>
Surgical approach: <value>
Approach / incision details: <value>
Reduction details: <value>
Plate and screw fixation: <value>
Distal radioulnar joint assessed: <value>
Distal radioulnar joint assessment: <value>
Tendon assessment: <value>
Irrigation: <value>
Additional operative details: <value>
```

### 9.8 Post-operative-plan-only mode

The post-operative-plan-only output contains:

```text
Procedure: <label>
Side: <value>
Complications: <value, when entered>
Antibiotic prophylaxis: <value, when entered>
DVT prophylaxis: <value, when entered>
Loading / weight-bearing instructions: <value, when entered>
Post-operative monitoring / checks: <value, when entered>
Post-operative imaging: <value, when entered>
Dressing / immobilisation: <value, when entered>
Wound care: <value, when entered>
Physiotherapy / rehabilitation plan: <value, when entered>
Follow-up: <value, when entered>
Other post-operative instructions: <value, when entered>
```

Blank optional lines are omitted. If no plan detail is entered, retain the existing explicit no-plan fallback.

### 9.9 Handover mode

The T&O handover output contains:

```text
Procedure: <label>
Side: <value>
Findings: <value, when entered>
Complications: <value, when entered>
Dressing / immobilisation: <value, when entered>
Loading / weight-bearing instructions: <value, when entered>
Post-operative monitoring / checks: <value, when entered>
Post-operative imaging: <value, when entered>
Antibiotic prophylaxis: <value, when entered>
DVT prophylaxis: <value, when entered>
Physiotherapy / rehabilitation plan: <value, when entered>
Follow-up: <value, when entered>
Other post-operative instructions: <value, when entered>
```

Implant identifiers are full-note content and are not repeated in the short handover output.

## 10. Validation and advisory warnings

Warnings are documentation prompts only. They must not say that a clinical choice is correct or incorrect.

### 10.1 Blocking validation

The fixed draft proposes these blocking fields for every T&O procedure:

- indication;
- findings;
- side.

The side requirement needs explicit clinical approval before implementation. The first release does not support bilateral notes.

Generation must also be blocked when `implantsUsed = no` while any procedure-specific fixation-performed status is `yes` or any procedure-specific fixation-details field is non-blank. Exact error text:

```text
Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.
```

This is a data-consistency check, not an assertion that a particular procedure must use an implant. The user can record `Implants used: no` when that is accurate. The T&O validation error type must deliberately add `side` and `implantsUsed` as typed error targets; it must not cast around the current `"indication" | "findings"` field union.

### 10.2 Shared T&O advisory warnings

Exact warning text:

- blank `caseClassification`: `No case classification entered. Add elective or non-elective status if available.`
- blank `operationDateTime`: `No operation date/time entered. Add the date and time if available.`
- blank `operativeDiagnosis`: `No operative diagnosis entered. Add the diagnosis if available.`
- blank `complications`: `No complications status entered. Record complications or explicitly state none if that is accurate.`
- blank `tourniquetUsed`: `Tourniquet use not recorded. Confirm whether it was used, not used or not applicable.`
- `tourniquetUsed = yes` with missing details: `Tourniquet marked as used without complete site, pressure and duration details. Add available details.`
- blank `imageIntensifierUsed`: `Image-intensifier use not recorded. Confirm whether it was used or not applicable.`
- `imageIntensifierUsed = yes` with blank findings: `Image intensifier marked as used without final imaging findings. Add the recorded findings if available.`
- blank `additionalProcedurePerformed`: `Additional-procedure status not recorded. Confirm whether an additional procedure was performed.`
- `additionalProcedurePerformed = yes` with blank details: `Additional procedure marked as performed without procedure details. Add the procedure performed.`
- `additionalProcedurePerformed = yes` with blank reason: `Additional procedure marked as performed without a reason. Add the reason if available.`
- blank `implantsUsed`: `Implant use not recorded. Confirm whether implants were used.`
- `implantsUsed = yes` with no rows: `Implants marked as used without implant details. Add implant records and verify the theatre traceability record.`
- a non-empty implant row with blank component: `An implant record has no component name. Add the component.`
- a non-empty implant row with blank identifier: `An implant record has no lot, serial or reference number. Add the available identifier and verify the theatre traceability record.`
- blank `closureDetails`: `No closure details entered. Add the closure technique if available.`
- blank `loadingInstructions`: `No loading or weight-bearing instructions entered. Add the operative plan if available.`
- blank `postoperativeImaging`: `No post-operative imaging plan entered. Confirm whether imaging is required or not applicable.`
- blank `followUp`: `No follow-up plan entered. Add follow-up details if available.`
- blank `antibioticProphylaxis`: `No antibiotic prophylaxis entered. Confirm whether it was given or not applicable.`
- blank `dvtProphylaxis`: `No DVT prophylaxis entered. Record the plan or explicitly state not applicable if that is accurate.`

The warning system must not insert `none`, `not required`, a drug, dose, duration, loading status or follow-up interval on the user's behalf.

### 10.3 Ankle ORIF warnings

- blank reduction details: `No ankle-fracture reduction details entered. Add the reduction performed if available.`
- all three malleolar fixation-status fields blank: `No malleolar fixation status entered. Record the relevant fibular, medial or posterior malleolar fixation status.`
- blank syndesmosis status: `Syndesmosis assessment not recorded. Confirm whether it was assessed.`
- assessed with no details: `Syndesmosis marked as assessed without method or findings. Add the recorded assessment.`
- stabilised with no fixation details: `Syndesmosis marked as stabilised without fixation details. Add the fixation performed.`

### 10.4 Hip hemiarthroplasty warnings

- blank approach: `No hemiarthroplasty approach entered. Add the approach used.`
- blank stem fixation: `No stem-fixation method entered. Add the fixation used.`
- cemented with blank cement details: `Cemented fixation selected without cement or cementing details. Add available details and verify the implant record.`
- blank trial/reduction: `No trial and reduction details entered. Add the recorded details if available.`
- blank stability assessment: `No stability assessment entered. Add the recorded assessment if available.`

Selecting `Uncemented` must not trigger a warning that recommends cemented fixation. The generator records the operation; it does not judge the treatment choice.

### 10.5 Dynamic hip screw warnings

- blank reduction details: `No fracture-reduction details entered. Add the reduction performed if available.`
- blank lag-screw details: `No guidewire or lag-screw placement details entered. Add the recorded details if available.`
- blank plate details: `No side-plate fixation details entered. Add the fixation performed if available.`

### 10.6 Cephalomedullary nail warnings

- blank reduction details: `No fracture-reduction details entered. Add the reduction performed if available.`
- blank entry point: `No entry-point, approach or incision details entered. Add the recorded details if available.`
- blank proximal fixation: `No proximal fixation details entered. Add the fixation performed if available.`
- blank distal locking status: `Distal-locking status not recorded. Confirm whether distal locking was performed or not applicable.`
- distal locking yes with no details: `Distal locking marked as performed without details. Add the fixation performed.`

### 10.7 Distal radius ORIF warnings

- blank approach: `No distal-radius approach entered. Add the approach used.`
- blank reduction details: `No distal-radius reduction details entered. Add the reduction performed if available.`
- blank fixation details: `No plate or screw fixation details entered. Add the fixation performed if available.`
- blank DRUJ status: `Distal radioulnar joint assessment not recorded. Confirm whether it was assessed.`
- assessed with no findings: `Distal radioulnar joint marked as assessed without findings. Add the recorded assessment.`

## 11. Test contract before production implementation

Production changes must follow test-driven development. This section becomes executable only after the relevant rows in the clinical approval record have passed form/data review. Until then it defines future tests; it does not authorise implementation against unapproved wording.

### 11.1 Parity guard

Before refactoring the common type or completion component:

- capture or retain all seven existing procedure fixtures;
- assert all 23 existing literal outputs remain byte-for-byte identical;
- assert current existing warnings remain unchanged;
- assert no existing procedure acquires a T&O field or T&O warning.

### 11.2 Metadata tests

Add failing tests for:

- every procedure having a specialty, category, keywords and completion profile;
- picker grouping by specialty;
- search matching `ankle` and `ORIF` in the ankle-first slice;
- search matching `DHS`, `NOF`, `wrist` and `nail` only after the corresponding future procedure is separately approved and registered;
- visible labels using full procedure names;
- existing search and selection behaviour remaining accessible.

### 11.3 T&O shared-model tests

Add failing tests for:

- side validation;
- blank-by-default T&O operation time and unchanged general-surgery timestamp behaviour;
- operative-diagnosis output and warning behaviour;
- specimen/sample and haemostasis output without inferred assertions;
- dedicated typed implant-row add/edit/remove/reorder and output;
- empty-row omission, partial-row output and deterministic per-row warning order;
- implant status clearing rows;
- blocking implant/fixation consistency validation;
- tourniquet, imaging and additional-procedure dependency clearing;
- literal output for every controller state: `yes`, `no`, `not applicable` and unanswered;
- missing-value semantics;
- full, postoperative-plan and handover section contents;
- exactly one full-note `Dressing / immobilisation` line;
- no implant identifiers in handover;
- no duplicate clinical lines;
- user-entered strings rendered safely;
- changing any scalar or implant-row field invalidating the generated draft and copy approval;
- changing procedure resetting the whole input, controls, validation, draft/review state, feedback and output mode.

### 11.4 Procedure tests

For each new procedure, add failing tests before implementation for:

- default state;
- form labels and controls;
- conditional details and clearing;
- a representative synthetic full note;
- postoperative-plan-only output;
- handover output;
- advisory warnings;
- explicit `no` and `not applicable` values;
- stale unrelated values being absent;
- no invented normal findings, fixation details, implant values or postoperative restrictions.

Expected note strings and warning arrays must be checked-in independent literals, not values assembled from production generator helpers. Only synthetic cases may be used in tests, screenshots and review.

## 12. Clinical review protocol

Each procedure must pass two separate reviews.

### Pass A: form and data contract

Review:

- visible procedure name;
- field labels;
- options and custom-value support;
- conditional relationships;
- missing-value behaviour;
- warning wording;
- whether any field pressures the user toward an answer.

### Pass B: generated text

Using at least two synthetic cases per procedure, review:

- operative sequence;
- whether a line implies an event not entered;
- absence of contradictions and duplicate facts;
- implant readability and traceability caveat;
- closure and complications wording;
- postoperative loading, imaging, rehabilitation and follow-up instructions;
- suitability of full-note, postoperative-plan and handover modes.

Clinical approval must be recorded procedure by procedure. Approval of ankle ORIF does not approve the other four templates.

### Clinical approval record

| Contract area | Form/data review | Generated-text review | Approver/date |
| --- | --- | --- | --- |
| Shared T&O fields, dependencies and warning principles | Approved for implementation | Approved through ankle ORIF synthetic preview | Sangeev, 2026-07-20 |
| Ankle ORIF | Approved for implementation | Approved | Sangeev, 2026-07-20 |
| Hip hemiarthroplasty for fracture | Approved for implementation | Pending synthetic preview | Sangeev, 2026-07-20 |
| Dynamic hip screw fixation | Approved for implementation | Pending synthetic preview | Sangeev, 2026-07-20 |
| Cephalomedullary nail fixation | Approved for implementation | Pending synthetic preview | Sangeev, 2026-07-20 |
| Distal radius ORIF | Approved for implementation | Pending synthetic preview | Sangeev, 2026-07-20 |

A status changes from `Pending` only after explicit clinical approval. Passing automated tests is not clinical approval.

## 13. Release gates

No T&O procedure may be deployed until:

- its field contract and output wording are clinically approved;
- all new tests were observed failing before implementation and then passing;
- all existing parity fixtures remain exact;
- the full test suite, lint, build and audit commands pass;
- a production build is generated;
- desktop and mobile synthetic workflows pass in a browser;
- no browser console errors occur;
- no patient data is used;
- no form data is stored, transmitted or logged;
- the generated note remains stale after edits until regenerated and re-reviewed;
- Sangeev approves the preview;
- deployment is separately authorised and a rollback path is documented.

## 14. Decisions requiring clinical sign-off

The scope, ankle-first implementation order and structured implant rows were accepted in principle on 20 July 2026. Sangeev authorised implementation of the shared T&O model and ankle ORIF on the same date. For this slice, that confirms:

- `Side` blocks generation when unanswered;
- `Case classification` uses the simple `Elective` / `Non-elective` choice;
- ankle ORIF uses the malleolar and syndesmosis structure in section 7.1;
- tourniquet site, pressure and duration remain separate fields;
- T&O uses free-text `Haemostasis details` rather than the existing yes/no haemostasis control;
- each implant row uses one combined `Lot / serial / reference number` field;
- the exact shared and ankle warning set in sections 10.2 and 10.3 is accepted, including which blank fields remain silent;
- no Cardiff and Vale antibiotic, thromboprophylaxis, imaging, rehabilitation or follow-up protocol is encoded until a current local source is separately reviewed.

On 20 July 2026, Sangeev approved the existing form/data contracts, labels and warning sets for the four remaining roadmap procedures and authorised their implementation. Approval to implement is not approval to deploy: procedure-specific synthetic generated-text review and the release gates in sections 12 and 13 still apply to those four procedures.

Implementation status on 20 July 2026: all five roadmap procedures are present in the undeployed v2 source candidate. Automated contract, warning, direct-state leakage, implant-consistency, React workflow, accessibility, privacy, build and v1-parity gates pass. The checked-in synthetic full-note, postoperative-plan and handover literals are review evidence only; generated-text clinical approval for hip hemiarthroplasty, dynamic hip screw, cephalomedullary nail and distal radius ORIF remains pending in the table above.

## 15. Primary sources

Sources checked on 20 July 2026:

1. Royal College of Surgeons of England. *Good Surgical Practice*. March 2025, section 3.5, `Record your work clearly, accurately and legibly`. <https://www.rcseng.ac.uk/-/media/Files/RCS/Standards-and-research/GSP/Good-Surgical-Practice-Guide-2025.pdf>
2. British Orthopaedic Association. *BOAST: The Management of Ankle Fractures*. Published and last updated August 2016. <https://www.boa.ac.uk/resource/boast-12-pdf.html>
3. National Institute for Health and Care Excellence. *Hip fracture: management* (CG124). Published 22 June 2011; last updated 6 January 2023. <https://www.nice.org.uk/guidance/cg124/chapter/recommendations>

Source use is deliberately narrow:

- RCS supports the general operation-record content prompts;
- BOAST supports the ankle-specific documentation areas and need for an explicit postoperative plan;
- NICE supports hip-fracture procedure context and explicit rehabilitation/loading documentation;
- none of these sources authorises the app to choose clinical answers or replace local policy.
