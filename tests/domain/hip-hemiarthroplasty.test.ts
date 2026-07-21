import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROCEDURE_DEFINITIONS,
  generateNote,
  getAdvisoryWarnings,
  validateProcedureInput,
} from "../../src/domain/index.ts";
import type { HipHemiarthroplastyInput } from "../../src/domain/types.ts";
import { completeTnoCommon } from "./tno-test-fixtures.ts";

const completeHipHemiInput: HipHemiarthroplastyInput = {
  ...completeTnoCommon,
  procedureId: "hip-hemiarthroplasty",
  indication: "Synthetic displaced intracapsular hip fracture",
  findings: "Synthetic displaced femoral neck fracture",
  operativeDiagnosis: "Synthetic displaced left femoral neck fracture",
  tissueDetails: "Synthetic femoral head removed",
  hemiApproach: "Anterolateral",
  hemiApproachAndIncisionDetails: "Synthetic anterolateral approach and incision",
  hemiCapsuleManagement: "Synthetic capsulotomy detail",
  hemiFemoralHeadExcision: "Synthetic femoral-head excision detail",
  hemiNativeHeadSize: "Synthetic 46 mm measurement",
  hemiCanalPreparation: "Synthetic sequential canal preparation",
  hemiStemFixation: "Cemented",
  hemiCementDetails: "Synthetic cement and cementing detail",
  hemiTrialAndReduction: "Synthetic trial and reduction detail",
  hemiStabilityAssessment: "Synthetic stability assessment",
  hemiLegLengthAndOffset: "Synthetic leg-length and offset assessment",
  hemiCapsuleAndAbductorRepair: "Synthetic capsule and abductor repair",
};

const expectedFullNote = `Procedure: Hip hemiarthroplasty for fracture

Date/time: 20/07/2026, 09:10

Case classification: Non-elective

Side: Left

Surgeon / Assistant: Surgeon Synthetic Surgeon A; Assistant Synthetic Assistant B

Additional team members: not specified

Supervising consultant: Synthetic Consultant C

Anaesthetic: GA

Anaesthetist: Synthetic Anaesthetist D

Indication:
Synthetic displaced intracapsular hip fracture

Operative diagnosis:
Synthetic displaced left femoral neck fracture

Findings:
Synthetic displaced femoral neck fracture

Position / table set-up: Synthetic position and table setup

Operation:
Tourniquet used: no
Surgical approach: Anterolateral
Approach / incision details: Synthetic anterolateral approach and incision
Capsule management: Synthetic capsulotomy detail
Femoral head excision: Synthetic femoral-head excision detail
Native femoral head size: Synthetic 46 mm measurement
Femoral canal preparation: Synthetic sequential canal preparation
Stem fixation: Cemented
Cement and cementing details: Synthetic cement and cementing detail
Trial and reduction: Synthetic trial and reduction detail
Stability assessment: Synthetic stability assessment
Leg length / offset assessment: Synthetic leg-length and offset assessment
Capsule / abductor repair: Synthetic capsule and abductor repair
Additional operative details: Synthetic additional operative details
Image intensifier used: yes
Final intraoperative imaging: Synthetic final imaging findings
Additional procedure performed: no

Specimens / samples: not specified

Implants:
1. Component: Synthetic component; manufacturer: Synthetic manufacturer; product / system: Synthetic system; size: Synthetic size; lot / serial / reference: SYN-REF-100

Tissue removed, added or altered: Synthetic femoral head removed

Estimated blood loss: 100 mL

Complications: none

Haemostasis: Synthetic haemostasis detail

Closure: Synthetic closure detail

Post-operative plan:
Antibiotic prophylaxis: Synthetic antibiotic entry
DVT prophylaxis: Synthetic DVT entry
Loading / weight-bearing instructions: Synthetic loading instruction
Post-operative monitoring / checks: Synthetic monitoring instruction
Post-operative imaging: Synthetic postoperative imaging plan
Dressing / immobilisation: Synthetic dressing and immobilisation
Wound care: Synthetic wound-care instruction
Physiotherapy / rehabilitation plan: Synthetic rehabilitation plan
Follow-up: Synthetic follow-up plan
Other post-operative instructions: Synthetic other postoperative instructions`;

const expectedPostOpNote = `Procedure: Hip hemiarthroplasty for fracture
Side: Left
Complications: none
Antibiotic prophylaxis: Synthetic antibiotic entry
DVT prophylaxis: Synthetic DVT entry
Loading / weight-bearing instructions: Synthetic loading instruction
Post-operative monitoring / checks: Synthetic monitoring instruction
Post-operative imaging: Synthetic postoperative imaging plan
Dressing / immobilisation: Synthetic dressing and immobilisation
Wound care: Synthetic wound-care instruction
Physiotherapy / rehabilitation plan: Synthetic rehabilitation plan
Follow-up: Synthetic follow-up plan
Other post-operative instructions: Synthetic other postoperative instructions`;

const expectedHandoverNote = `Procedure: Hip hemiarthroplasty for fracture
Side: Left
Findings: Synthetic displaced femoral neck fracture
Complications: none
Dressing / immobilisation: Synthetic dressing and immobilisation
Loading / weight-bearing instructions: Synthetic loading instruction
Post-operative monitoring / checks: Synthetic monitoring instruction
Post-operative imaging: Synthetic postoperative imaging plan
Antibiotic prophylaxis: Synthetic antibiotic entry
DVT prophylaxis: Synthetic DVT entry
Physiotherapy / rehabilitation plan: Synthetic rehabilitation plan
Follow-up: Synthetic follow-up plan
Other post-operative instructions: Synthetic other postoperative instructions`;

export { completeHipHemiInput };

describe("hip hemiarthroplasty domain contract", () => {
  it("registers the approved procedure metadata", () => {
    assert.deepEqual(PROCEDURE_DEFINITIONS["hip-hemiarthroplasty"], {
      id: "hip-hemiarthroplasty",
      label: "Hip hemiarthroplasty for fracture",
      specialty: "trauma-orthopaedics",
      category: "Hip-fracture surgery",
      keywords: ["hip", "hemiarthroplasty", "hemi", "neck of femur", "NOF"],
      completionProfile: "orthopaedics",
      supportedOutputModes: ["full", "postOp", "handover"],
    });
  });

  it("generates all three independent literal outputs", () => {
    assert.equal(generateNote(completeHipHemiInput, "full"), expectedFullNote);
    assert.equal(generateNote(completeHipHemiInput, "postOp"), expectedPostOpNote);
    assert.equal(generateNote(completeHipHemiInput, "handover"), expectedHandoverNote);
    assert.doesNotMatch(generateNote(completeHipHemiInput, "handover"), /SYN-REF|Implants/);
  });

  it("returns procedure warnings in deterministic order", () => {
    assert.deepEqual(getAdvisoryWarnings({
      ...completeHipHemiInput,
      hemiApproach: "",
      hemiStemFixation: "",
      hemiTrialAndReduction: "",
      hemiStabilityAssessment: "",
    }), [
      "No hemiarthroplasty approach entered. Add the approach used.",
      "No stem-fixation method entered. Add the fixation used.",
      "No trial and reduction details entered. Add the recorded details if available.",
      "No stability assessment entered. Add the recorded assessment if available.",
    ]);
  });

  it("gates cement details on cemented fixation in output and warnings", () => {
    const malformed = {
      ...completeHipHemiInput,
      hemiStemFixation: "Uncemented",
      hemiCementDetails: "STALE CEMENT DETAIL",
    };
    assert.doesNotMatch(generateNote(malformed, "full"), /STALE CEMENT DETAIL|Cement and cementing details/);
    assert.doesNotMatch(getAdvisoryWarnings(malformed).join("\n"), /cement/i);

    assert.deepEqual(getAdvisoryWarnings({ ...completeHipHemiInput, hemiCementDetails: "" }), [
      "Cemented fixation selected without cement or cementing details. Add available details and verify the implant record.",
    ]);
  });

  it("requires side and blocks implants-no with stem fixation details", () => {
    assert.deepEqual(validateProcedureInput(completeHipHemiInput), { valid: true, errors: [] });
    assert.deepEqual(validateProcedureInput({ ...completeHipHemiInput, side: "" }).errors, [
      { field: "side", message: "Side is required." },
    ]);
    assert.deepEqual(validateProcedureInput({ ...completeHipHemiInput, implantsUsed: "no" }).errors, [{
      field: "implantsUsed",
      message: "Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.",
    }]);
  });
});
