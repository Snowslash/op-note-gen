import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROCEDURE_DEFINITIONS,
  generateNote,
  getAdvisoryWarnings,
  validateProcedureInput,
} from "../../src/domain/index.ts";
import type { AnkleOrifInput } from "../../src/domain/types.ts";

const completeAnkleInput: AnkleOrifInput = {
  procedureId: "ankle-orif",
  operationDateTime: "2026-07-20T14:35",
  surgeon: "Synthetic Surgeon A",
  assistant: "Synthetic Assistant B",
  supervisingConsultant: "Synthetic Consultant C",
  anaesthetic: "GA",
  anaesthetist: "Synthetic Anaesthetist D",
  indication: "Synthetic displaced ankle fracture",
  findings: "Synthetic unstable bimalleolar ankle fracture",
  bloodLoss: "50 mL",
  complications: "none",
  antibioticProphylaxis: "Synthetic prophylaxis documented",
  dvtProphylaxis: "Synthetic prophylaxis plan documented",
  postOpPlan: "Synthetic elevation and analgesia instructions",
  additionalOperativeDetails: "Synthetic final operative detail",
  additionalTeamMembers: [],
  caseClassification: "Non-elective",
  side: "Right",
  operativeDiagnosis: "Synthetic closed unstable right ankle fracture",
  positionAndTableSetup: "Supine",
  tourniquetUsed: "yes",
  tourniquetSite: "Right thigh",
  tourniquetPressure: "250 mmHg",
  tourniquetDuration: "62 minutes",
  imageIntensifierUsed: "yes",
  finalImagingFindings: "Synthetic mortise alignment and implant position recorded",
  additionalProcedurePerformed: "no",
  additionalProcedureDetails: "",
  additionalProcedureReason: "",
  specimensOrSamples: "",
  tissueDetails: "Synthetic fracture callus altered during reduction",
  implantsUsed: "yes",
  implants: [
    {
      id: "implant-test-1",
      component: "Fibular plate",
      manufacturer: "Synthetic Manufacturer",
      productOrSystem: "Synthetic Ankle System",
      size: "6-hole",
      lotSerialOrReference: "SYN-REF-001",
    },
    {
      id: "implant-test-2",
      component: "Syndesmosis screw",
      manufacturer: "",
      productOrSystem: "",
      size: "",
      lotSerialOrReference: "SYN-REF-002",
    },
  ],
  haemostasisDetails: "Synthetic haemostasis documented",
  closureDetails: "Synthetic layered closure",
  dressingAndImmobilisation: "Synthetic sterile dressing and below-knee backslab",
  loadingInstructions: "Synthetic non-weight-bearing instruction",
  postoperativeMonitoring: "Synthetic neurovascular observations",
  postoperativeImaging: "Synthetic ankle radiographs requested",
  woundCare: "Synthetic wound review instruction",
  followUp: "Synthetic fracture-clinic follow-up",
  rehabilitationPlan: "Synthetic physiotherapy plan",
  ankleFracturePattern: "Synthetic bimalleolar fracture pattern",
  ankleApproachAndIncision: "Synthetic lateral fibular approach",
  ankleReductionMethod: "Open reduction",
  ankleReductionDetails: "Synthetic direct reduction under imaging",
  fibularFixationPerformed: "yes",
  fibularFixationDetails: "Synthetic plate and screw fixation",
  medialMalleolusFixationPerformed: "no",
  medialMalleolusFixationDetails: "",
  posteriorMalleolusFixationPerformed: "not applicable",
  posteriorMalleolusFixationDetails: "",
  syndesmosisAssessed: "yes",
  syndesmosisAssessmentDetails: "Synthetic stress assessment recorded",
  syndesmosisStabilised: "yes",
  syndesmosisFixationDetails: "Synthetic syndesmosis screw fixation",
  ankleIrrigationDetails: "Synthetic saline irrigation",
};

const expectedFullNote = `Procedure: Open reduction and internal fixation of ankle fracture

Date/time: 20/07/2026, 14:35

Case classification: Non-elective

Side: Right

Surgeon / Assistant: Surgeon Synthetic Surgeon A; Assistant Synthetic Assistant B

Additional team members: not specified

Supervising consultant: Synthetic Consultant C

Anaesthetic: GA

Anaesthetist: Synthetic Anaesthetist D

Indication:
Synthetic displaced ankle fracture

Operative diagnosis:
Synthetic closed unstable right ankle fracture

Findings:
Synthetic unstable bimalleolar ankle fracture

Position / table set-up: Supine

Operation:
Tourniquet used: yes
Tourniquet details: Site Right thigh; pressure 250 mmHg; duration 62 minutes
Fracture pattern: Synthetic bimalleolar fracture pattern
Approach / incision: Synthetic lateral fibular approach
Reduction method: Open reduction
Reduction details: Synthetic direct reduction under imaging
Fibular fixation performed: yes
Fibular fixation details: Synthetic plate and screw fixation
Medial malleolus fixation performed: no
Posterior malleolus fixation performed: not applicable
Syndesmosis assessed: yes
Syndesmosis assessment: Synthetic stress assessment recorded
Syndesmosis stabilised: yes
Syndesmosis fixation: Synthetic syndesmosis screw fixation
Irrigation: Synthetic saline irrigation
Additional operative details: Synthetic final operative detail
Image intensifier used: yes
Final intraoperative imaging: Synthetic mortise alignment and implant position recorded
Additional procedure performed: no

Specimens / samples: not specified

Implants:
1. Component: Fibular plate; manufacturer: Synthetic Manufacturer; product / system: Synthetic Ankle System; size: 6-hole; lot / serial / reference: SYN-REF-001
2. Component: Syndesmosis screw; lot / serial / reference: SYN-REF-002

Tissue removed, added or altered: Synthetic fracture callus altered during reduction

Estimated blood loss: 50 mL

Complications: none

Haemostasis: Synthetic haemostasis documented

Closure: Synthetic layered closure

Post-operative plan:
Antibiotic prophylaxis: Synthetic prophylaxis documented
DVT prophylaxis: Synthetic prophylaxis plan documented
Loading / weight-bearing instructions: Synthetic non-weight-bearing instruction
Post-operative monitoring / checks: Synthetic neurovascular observations
Post-operative imaging: Synthetic ankle radiographs requested
Dressing / immobilisation: Synthetic sterile dressing and below-knee backslab
Wound care: Synthetic wound review instruction
Physiotherapy / rehabilitation plan: Synthetic physiotherapy plan
Follow-up: Synthetic fracture-clinic follow-up
Other post-operative instructions: Synthetic elevation and analgesia instructions`;

const expectedPostOpNote = `Procedure: Open reduction and internal fixation of ankle fracture
Side: Right
Complications: none
Antibiotic prophylaxis: Synthetic prophylaxis documented
DVT prophylaxis: Synthetic prophylaxis plan documented
Loading / weight-bearing instructions: Synthetic non-weight-bearing instruction
Post-operative monitoring / checks: Synthetic neurovascular observations
Post-operative imaging: Synthetic ankle radiographs requested
Dressing / immobilisation: Synthetic sterile dressing and below-knee backslab
Wound care: Synthetic wound review instruction
Physiotherapy / rehabilitation plan: Synthetic physiotherapy plan
Follow-up: Synthetic fracture-clinic follow-up
Other post-operative instructions: Synthetic elevation and analgesia instructions`;

const expectedHandoverNote = `Procedure: Open reduction and internal fixation of ankle fracture
Side: Right
Findings: Synthetic unstable bimalleolar ankle fracture
Complications: none
Dressing / immobilisation: Synthetic sterile dressing and below-knee backslab
Loading / weight-bearing instructions: Synthetic non-weight-bearing instruction
Post-operative monitoring / checks: Synthetic neurovascular observations
Post-operative imaging: Synthetic ankle radiographs requested
Antibiotic prophylaxis: Synthetic prophylaxis documented
DVT prophylaxis: Synthetic prophylaxis plan documented
Physiotherapy / rehabilitation plan: Synthetic physiotherapy plan
Follow-up: Synthetic fracture-clinic follow-up
Other post-operative instructions: Synthetic elevation and analgesia instructions`;

export { completeAnkleInput, expectedFullNote, expectedHandoverNote, expectedPostOpNote };

describe("ankle ORIF domain contract", () => {
  it("registers the approved ankle procedure with v2 metadata", () => {
    assert.deepEqual(PROCEDURE_DEFINITIONS["ankle-orif"], {
      id: "ankle-orif",
      label: "Open reduction and internal fixation of ankle fracture",
      specialty: "trauma-orthopaedics",
      category: "Lower-limb trauma",
      keywords: ["ankle", "fracture", "ORIF", "malleolus", "syndesmosis"],
      completionProfile: "orthopaedics",
      supportedOutputModes: ["full", "postOp", "handover"],
    });
  });

  it("generates all three checked-in literal output modes", () => {
    assert.equal(generateNote(completeAnkleInput, "full"), expectedFullNote);
    assert.equal(generateNote(completeAnkleInput, "postOp"), expectedPostOpNote);
    assert.equal(generateNote(completeAnkleInput, "handover"), expectedHandoverNote);
    assert.doesNotMatch(generateNote(completeAnkleInput, "handover"), /SYN-REF|Implants/);
  });

  it("uses the explicit postoperative fallback when no plan details were entered", () => {
    const noPlan = {
      ...completeAnkleInput,
      complications: "",
      antibioticProphylaxis: "",
      dvtProphylaxis: "",
      loadingInstructions: "",
      postoperativeMonitoring: "",
      postoperativeImaging: "",
      dressingAndImmobilisation: "",
      woundCare: "",
      rehabilitationPlan: "",
      followUp: "",
      postOpPlan: "",
    };

    assert.equal(generateNote(noPlan, "postOp"), `Procedure: Open reduction and internal fixation of ankle fracture
Side: Right
Post-operative plan: no plan details entered.`);
  });

  it("trims but otherwise preserves entered T&O complication text", () => {
    const note = generateNote({ ...completeAnkleInput, complications: "  nil  " }, "postOp");

    assert.match(note, /^Complications: nil$/m);
    assert.doesNotMatch(note, /No immediate complications/);
  });

  it("validates side and blocks contradictory implant and fixation state", () => {
    assert.deepEqual(validateProcedureInput(completeAnkleInput), { valid: true, errors: [] });
    assert.deepEqual(validateProcedureInput({ ...completeAnkleInput, side: "" }), {
      valid: false,
      errors: [{ field: "side", message: "Side is required." }],
    });
    assert.deepEqual(validateProcedureInput({ ...completeAnkleInput, implantsUsed: "no" }), {
      valid: false,
      errors: [{
        field: "implantsUsed",
        message: "Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.",
      }],
    });
  });

  it("returns exact shared and ankle warnings in deterministic order", () => {
    const warnings = getAdvisoryWarnings({
      ...completeAnkleInput,
      operationDateTime: "",
      caseClassification: "",
      operativeDiagnosis: "",
      complications: "",
      tourniquetUsed: "",
      imageIntensifierUsed: "",
      additionalProcedurePerformed: "",
      implantsUsed: "",
      closureDetails: "",
      loadingInstructions: "",
      postoperativeImaging: "",
      followUp: "",
      antibioticProphylaxis: "",
      dvtProphylaxis: "",
      ankleReductionDetails: "",
      fibularFixationPerformed: "",
      fibularFixationDetails: "",
      medialMalleolusFixationPerformed: "",
      posteriorMalleolusFixationPerformed: "",
      syndesmosisAssessed: "",
      syndesmosisAssessmentDetails: "",
      syndesmosisStabilised: "",
      syndesmosisFixationDetails: "",
    });

    assert.deepEqual(warnings, [
      "No case classification entered. Add elective or non-elective status if available.",
      "No operation date/time entered. Add the date and time if available.",
      "No operative diagnosis entered. Add the diagnosis if available.",
      "No complications status entered. Record complications or explicitly state none if that is accurate.",
      "Tourniquet use not recorded. Confirm whether it was used, not used or not applicable.",
      "Image-intensifier use not recorded. Confirm whether it was used or not applicable.",
      "Additional-procedure status not recorded. Confirm whether an additional procedure was performed.",
      "Implant use not recorded. Confirm whether implants were used.",
      "No closure details entered. Add the closure technique if available.",
      "No loading or weight-bearing instructions entered. Add the operative plan if available.",
      "No post-operative imaging plan entered. Confirm whether imaging is required or not applicable.",
      "No follow-up plan entered. Add follow-up details if available.",
      "No antibiotic prophylaxis entered. Confirm whether it was given or not applicable.",
      "No DVT prophylaxis entered. Record the plan or explicitly state not applicable if that is accurate.",
      "No ankle-fracture reduction details entered. Add the reduction performed if available.",
      "No malleolar fixation status entered. Record the relevant fibular, medial or posterior malleolar fixation status.",
      "Syndesmosis assessment not recorded. Confirm whether it was assessed.",
    ]);
  });

  it("omits empty implant rows and warns on partial rows in visible order", () => {
    const partialRows: AnkleOrifInput = {
      ...completeAnkleInput,
      implants: [
        { id: "empty", component: " ", manufacturer: "", productOrSystem: "", size: "", lotSerialOrReference: "" },
        { id: "partial", component: "", manufacturer: "Synthetic Manufacturer", productOrSystem: "", size: "", lotSerialOrReference: "" },
      ],
    };

    assert.deepEqual(getAdvisoryWarnings(partialRows), [
      "An implant record has no component name. Add the component.",
      "An implant record has no lot, serial or reference number. Add the available identifier and verify the theatre traceability record.",
    ]);
    const note = generateNote(partialRows, "full");
    assert.doesNotMatch(note, /empty/);
    assert.match(note, /1\. manufacturer: Synthetic Manufacturer/);
  });

  it("does not leak stale hidden controller details or interpret hostile text", () => {
    const hostile = '<img src=x onerror="synthetic()">';
    const staleHiddenState: AnkleOrifInput = {
      ...completeAnkleInput,
      indication: hostile,
      tourniquetUsed: "no",
      tourniquetSite: "STALE TOURNIQUET SITE",
      imageIntensifierUsed: "not applicable",
      finalImagingFindings: "STALE IMAGE FINDING",
      additionalProcedurePerformed: "no",
      additionalProcedureDetails: "STALE PROCEDURE",
      additionalProcedureReason: "STALE REASON",
      syndesmosisAssessed: "no",
      syndesmosisAssessmentDetails: "STALE SYNDESMOSIS ASSESSMENT",
      syndesmosisStabilised: "yes",
      syndesmosisFixationDetails: "STALE SYNDESMOSIS FIXATION",
    };
    const note = generateNote(staleHiddenState, "full");

    assert.match(note, new RegExp(hostile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(note, /STALE/);
    assert.doesNotMatch(getAdvisoryWarnings(staleHiddenState).join("\n"), /marked as stabilised/);
    assert.match(note, /Tourniquet used: no/);
    assert.match(note, /Image intensifier used: not applicable/);
    assert.match(note, /Additional procedure performed: no/);
  });
});
