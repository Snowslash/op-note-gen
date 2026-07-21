import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROCEDURE_DEFINITIONS,
  generateNote,
  getAdvisoryWarnings,
  validateProcedureInput,
} from "../../src/domain/index.ts";
import { readFileSync } from "node:fs";
import type { OrthopaedicProcedureInput, OutputMode } from "../../src/domain/types.ts";
import {
  completeCmnInput,
  completeDhsInput,
  completeDistalRadiusInput,
} from "./tno-test-fixtures.ts";

const checkedInOutputs = JSON.parse(
  readFileSync(new URL("../fixtures/tno/remaining-procedure-outputs.json", import.meta.url), "utf8"),
) as Record<"dynamic-hip-screw" | "cephalomedullary-nail" | "distal-radius-orif", Record<OutputMode, string>>;

const expectedDhsOperation = `Tourniquet used: no
Fracture pattern: Synthetic intertrochanteric fracture pattern
Reduction method: Closed reduction
Reduction details: Synthetic closed reduction detail
Approach / incision: Synthetic lateral approach and incision
Guidewire and lag-screw placement: Synthetic guidewire and lag-screw placement
Side-plate and screw fixation: Synthetic side-plate and screw fixation
Compression applied: yes
Irrigation: Synthetic irrigation detail
Additional operative details: Synthetic additional operative details
Image intensifier used: yes
Final intraoperative imaging: Synthetic final imaging findings
Additional procedure performed: no`;

const expectedCmnOperation = `Tourniquet used: no
Fracture pattern: Synthetic subtrochanteric fracture pattern
Reduction method: Combined closed and open reduction
Reduction details: Synthetic combined reduction detail
Entry point / approach / incision: Synthetic entry point, approach and incision
Canal preparation: Synthetic canal preparation
Nail insertion: Synthetic nail insertion detail
Proximal fixation: Synthetic proximal fixation detail
Distal locking performed: yes
Distal locking details: Synthetic distal locking detail
Compression applied: not applicable
Irrigation: Synthetic irrigation detail
Additional operative details: Synthetic additional operative details
Image intensifier used: yes
Final intraoperative imaging: Synthetic final imaging findings
Additional procedure performed: no`;

const expectedDistalRadiusOperation = `Tourniquet used: no
Fracture pattern: Synthetic intra-articular fracture pattern
Surgical approach: Volar
Approach / incision details: Synthetic volar approach and incision
Reduction details: Synthetic reduction detail
Plate and screw fixation: Synthetic plate and screw fixation
Distal radioulnar joint assessed: yes
Distal radioulnar joint assessment: Synthetic DRUJ assessment findings
Tendon assessment: Synthetic tendon assessment
Irrigation: Synthetic irrigation detail
Additional operative details: Synthetic additional operative details
Image intensifier used: yes
Final intraoperative imaging: Synthetic final imaging findings
Additional procedure performed: no`;

function extractOperation(note: string): string {
  return note.split("Operation:\n")[1]?.split("\n\nSpecimens / samples:")[0] ?? "";
}

const cases: Array<{
  id: keyof typeof checkedInOutputs;
  label: string;
  input: OrthopaedicProcedureInput;
  operation: string;
}> = [
  { id: "dynamic-hip-screw", label: "Dynamic hip screw fixation", input: completeDhsInput, operation: expectedDhsOperation },
  { id: "cephalomedullary-nail", label: "Cephalomedullary nail fixation", input: completeCmnInput, operation: expectedCmnOperation },
  { id: "distal-radius-orif", label: "Open reduction and internal fixation of distal radius fracture", input: completeDistalRadiusInput, operation: expectedDistalRadiusOperation },
];

describe("remaining T&O procedure domain contracts", () => {
  it("registers the approved metadata and search aliases", () => {
    assert.deepEqual(PROCEDURE_DEFINITIONS["dynamic-hip-screw"], {
      id: "dynamic-hip-screw",
      label: "Dynamic hip screw fixation",
      specialty: "trauma-orthopaedics",
      category: "Hip-fracture surgery",
      keywords: ["hip", "DHS", "sliding hip screw", "trochanteric fracture"],
      completionProfile: "orthopaedics",
      supportedOutputModes: ["full", "postOp", "handover"],
    });
    assert.deepEqual(PROCEDURE_DEFINITIONS["cephalomedullary-nail"], {
      id: "cephalomedullary-nail",
      label: "Cephalomedullary nail fixation",
      specialty: "trauma-orthopaedics",
      category: "Hip-fracture surgery",
      keywords: ["hip", "nail", "CMN", "IM nail", "cephalomedullary", "subtrochanteric"],
      completionProfile: "orthopaedics",
      supportedOutputModes: ["full", "postOp", "handover"],
    });
    assert.deepEqual(PROCEDURE_DEFINITIONS["distal-radius-orif"], {
      id: "distal-radius-orif",
      label: "Open reduction and internal fixation of distal radius fracture",
      specialty: "trauma-orthopaedics",
      category: "Upper-limb trauma",
      keywords: ["wrist", "distal radius", "fracture", "ORIF", "volar plate"],
      completionProfile: "orthopaedics",
      supportedOutputModes: ["full", "postOp", "handover"],
    });
  });

  it("generates all three modes byte-for-byte against checked-in independent literals", () => {
    for (const { id, input, label, operation } of cases) {
      const full = generateNote(input, "full");
      assert.equal(full, checkedInOutputs[id].full, input.procedureId);
      assert.equal(extractOperation(full), operation, input.procedureId);
      assert.match(full, new RegExp(`^Procedure: ${label}`));
      assert.equal((full.match(/Dressing \/ immobilisation:/g) ?? []).length, 1);
      assert.doesNotMatch(full, /satisfactory|anatomical|clinically appropriate/i);
      assert.equal(generateNote(input, "postOp"), checkedInOutputs[id].postOp);
      assert.equal(generateNote(input, "handover"), checkedInOutputs[id].handover);
      assert.doesNotMatch(generateNote(input, "handover"), /SYN-REF|Implants/);
    }
  });

  it("returns exact DHS warnings and blocks implants-no with fixation details", () => {
    assert.deepEqual(getAdvisoryWarnings({
      ...completeDhsInput,
      dhsReductionDetails: "",
      dhsGuidewireAndLagScrewDetails: "",
      dhsPlateFixationDetails: "",
    }), [
      "No fracture-reduction details entered. Add the reduction performed if available.",
      "No guidewire or lag-screw placement details entered. Add the recorded details if available.",
      "No side-plate fixation details entered. Add the fixation performed if available.",
    ]);
    assert.equal(validateProcedureInput({ ...completeDhsInput, implantsUsed: "no" }).errors[0]?.field, "implantsUsed");
  });

  it("blocks affirmative compression with implants marked not used for DHS and CMN", () => {
    const dhsContradiction = validateProcedureInput({
      ...completeDhsInput,
      implantsUsed: "no",
      dhsGuidewireAndLagScrewDetails: "",
      dhsPlateFixationDetails: "",
      dhsCompressionApplied: "yes",
    });
    const cmnContradiction = validateProcedureInput({
      ...completeCmnInput,
      implantsUsed: "no",
      cmnNailInsertionDetails: "",
      cmnProximalFixationDetails: "",
      cmnDistalLockingPerformed: "no",
      cmnDistalLockingDetails: "",
      cmnCompressionApplied: "yes",
    });

    assert.deepEqual(dhsContradiction.errors, [{
      field: "implantsUsed",
      message: "Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.",
    }]);
    assert.deepEqual(cmnContradiction.errors, dhsContradiction.errors);
  });

  it("returns exact CMN warnings and gates stale distal-locking details", () => {
    assert.deepEqual(getAdvisoryWarnings({
      ...completeCmnInput,
      cmnReductionDetails: "",
      cmnEntryPointAndIncision: "",
      cmnProximalFixationDetails: "",
      cmnDistalLockingPerformed: "",
      cmnDistalLockingDetails: "",
    }), [
      "No fracture-reduction details entered. Add the reduction performed if available.",
      "No entry-point, approach or incision details entered. Add the recorded details if available.",
      "No proximal fixation details entered. Add the fixation performed if available.",
      "Distal-locking status not recorded. Confirm whether distal locking was performed or not applicable.",
    ]);
    const malformed = { ...completeCmnInput, cmnDistalLockingPerformed: "no", cmnDistalLockingDetails: "STALE DISTAL LOCKING" };
    assert.doesNotMatch(generateNote(malformed, "full"), /STALE DISTAL LOCKING|Distal locking details:/);
    assert.doesNotMatch(getAdvisoryWarnings(malformed).join("\n"), /performed without details/);
    assert.deepEqual(getAdvisoryWarnings({ ...completeCmnInput, cmnDistalLockingDetails: "" }), [
      "Distal locking marked as performed without details. Add the fixation performed.",
    ]);
    assert.equal(validateProcedureInput({ ...completeCmnInput, implantsUsed: "no" }).errors[0]?.field, "implantsUsed");
  });

  it("returns exact distal-radius warnings and gates stale DRUJ findings", () => {
    assert.deepEqual(getAdvisoryWarnings({
      ...completeDistalRadiusInput,
      distalRadiusApproach: "",
      distalRadiusReductionDetails: "",
      distalRadiusFixationDetails: "",
      distalRadiusDrujAssessed: "",
      distalRadiusDrujDetails: "",
    }), [
      "No distal-radius approach entered. Add the approach used.",
      "No distal-radius reduction details entered. Add the reduction performed if available.",
      "No plate or screw fixation details entered. Add the fixation performed if available.",
      "Distal radioulnar joint assessment not recorded. Confirm whether it was assessed.",
    ]);
    const malformed = { ...completeDistalRadiusInput, distalRadiusDrujAssessed: "no", distalRadiusDrujDetails: "STALE DRUJ FINDING" };
    assert.doesNotMatch(generateNote(malformed, "full"), /STALE DRUJ FINDING|Distal radioulnar joint assessment:/);
    assert.doesNotMatch(getAdvisoryWarnings(malformed).join("\n"), /assessed without findings/);
    assert.deepEqual(getAdvisoryWarnings({ ...completeDistalRadiusInput, distalRadiusDrujDetails: "" }), [
      "Distal radioulnar joint marked as assessed without findings. Add the recorded assessment.",
    ]);
    assert.equal(validateProcedureInput({ ...completeDistalRadiusInput, implantsUsed: "no" }).errors[0]?.field, "implantsUsed");
  });
});
