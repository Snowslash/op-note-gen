import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  PROCEDURE_DEFINITIONS,
  generateNote,
  getAdvisoryWarnings,
  validateProcedureInput,
} from "../../src/domain/index.ts";
import type { ProcedureId, ProcedureInput } from "../../src/domain/types";
import { adaptLegacyFixtureInput, type LegacyFixtureInput } from "./v1-fixture-adapter.ts";

const require = createRequire(import.meta.url);
const fixtures = require("../fixtures/v1/fixture-inputs.js") as FixtureCase[];
const expected = require("../fixtures/v1/expected-output.json") as Record<string, string>;

interface FixtureCase {
  id: string;
  mode: "full" | "postOp" | "handover";
  input: LegacyFixtureInput;
}

const procedureIds: ProcedureId[] = [
  "lap-appendicectomy",
  "lap-cholecystectomy",
  "diagnostic-laparoscopy",
  "incision-and-drainage",
  "open-inguinal-hernia-repair",
  "open-umbilical-hernia-repair",
  "emergency-laparotomy",
];

function fixtureFor<T extends ProcedureId>(procedureId: T): Extract<ProcedureInput, { procedureId: T }> {
  const fixture = fixtures.find((candidate) => adaptLegacyFixtureInput(candidate.input).procedureId === procedureId);

  if (!fixture) {
    throw new Error(`Missing full fixture for ${procedureId}`);
  }

  return adaptLegacyFixtureInput(fixture.input) as Extract<ProcedureInput, { procedureId: T }>;
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

function assertWarningsEqual(actual: string[], expectedMessages: string[]) {
  assert.deepEqual(actual, expectedMessages);
}

describe("v1 output parity", () => {
  it("matches every checked-in literal fixture byte-for-byte", () => {
    assert.equal(fixtures.length, 23);

    for (const fixture of fixtures) {
      assert.equal(generateNote(adaptLegacyFixtureInput(fixture.input), fixture.mode), expected[fixture.id], fixture.id);
    }
  });
});

describe("procedure registry", () => {
  it("contains exactly the seven authoritative procedures with stable labels and modes", () => {
    assert.deepEqual(Object.keys(PROCEDURE_DEFINITIONS).sort(), [...procedureIds].sort());

    assert.equal(PROCEDURE_DEFINITIONS["lap-appendicectomy"].label, "Laparoscopic appendicectomy");
    assert.equal(PROCEDURE_DEFINITIONS["lap-cholecystectomy"].label, "Laparoscopic cholecystectomy");
    assert.equal(PROCEDURE_DEFINITIONS["diagnostic-laparoscopy"].label, "Diagnostic laparoscopy +/- washout / adhesiolysis");
    assert.equal(PROCEDURE_DEFINITIONS["incision-and-drainage"].label, "Incision and drainage of abscess");
    assert.equal(PROCEDURE_DEFINITIONS["open-inguinal-hernia-repair"].label, "Open inguinal hernia repair");
    assert.equal(PROCEDURE_DEFINITIONS["open-umbilical-hernia-repair"].label, "Open umbilical hernia repair");
    assert.equal(PROCEDURE_DEFINITIONS["emergency-laparotomy"].label, "Emergency laparotomy");

    for (const definition of Object.values(PROCEDURE_DEFINITIONS)) {
      assert.deepEqual(definition.supportedOutputModes, ["full", "postOp", "handover"]);
    }
  });
});

describe("required-field validation", () => {
  for (const procedureId of procedureIds) {
    it(`accepts a complete ${procedureId} input`, () => {
      assert.deepEqual(validateProcedureInput(fixtureFor(procedureId)), { valid: true, errors: [] });
    });

    it(`returns structured indication and findings errors for incomplete ${procedureId} input`, () => {
      const complete = fixtureFor(procedureId);
      const incomplete = { ...complete, indication: "   ", findings: "" } as ProcedureInput;

      assert.deepEqual(validateProcedureInput(incomplete), {
        valid: false,
        errors: [
          { field: "indication", message: "Indication is required." },
          { field: "findings", message: "Findings are required." },
        ],
      });
    });
  }
});

describe("advisory warnings", () => {
  it("preserves the appendicectomy contamination and conversion advisory branches", () => {
    const input = fixtureFor("lap-appendicectomy");
    assertWarningsEqual(getAdvisoryWarnings({ ...input, contaminationPresent: "yes", washoutPerformed: "", convertedToOpen: true, conversionReason: "" }), [
      "Contamination marked as present without washout status. Confirm whether washout was performed.",
      "Converted to open without a reason. Add the reason if available.",
    ]);
  });

  it("preserves the cholecystectomy critical-view advisory branch", () => {
    const input = fixtureFor("lap-cholecystectomy");
    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      drainStatus: "no",
      criticalViewAchieved: "no",
      convertedToOpen: true,
      conversionReason: "",
    }), [
      "Critical view marked as not achieved. Ensure the operation narrative and plan are clinically reviewed.",
      "Converted to open without a reason. Add the reason if available.",
    ]);
  });

  it("preserves the diagnostic laparoscopy conversion advisory branch", () => {
    const input = fixtureFor("diagnostic-laparoscopy");
    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      drainStatus: "no",
      convertedToOpen: true,
      conversionReason: "",
    }), [
      "Converted to open without a reason. Add the reason if available.",
    ]);
  });

  it("preserves the incision-and-drainage specimen, packing, and swab advisory branches", () => {
    const input = fixtureFor("incision-and-drainage");
    assertWarningsEqual(getAdvisoryWarnings({ ...input, specimen: "", pusSwabSent: "yes", drainStatus: "", packingOrDrain: "" }), [
      "No drain status or packing details entered. Confirm whether the cavity was packed, drained, or left without either.",
      "Microbiology swab marked as sent. Consider documenting the specimen/swab in the specimen field.",
    ]);
  });

  it("preserves the inguinal mesh advisory branches", () => {
    const input = fixtureFor("open-inguinal-hernia-repair");
    assertWarningsEqual(getAdvisoryWarnings({ ...input, meshUsed: "yes", meshType: "", meshFixation: "" }), [
      "Mesh marked as used without mesh type. Add mesh type if available.",
      "Mesh marked as used without fixation details. Add mesh fixation if available.",
    ]);
  });

  it("preserves the umbilical mesh advisory branches", () => {
    const input = fixtureFor("open-umbilical-hernia-repair");
    assertWarningsEqual(getAdvisoryWarnings({ ...input, umbilicalMeshUsed: "yes", umbilicalMeshType: "", umbilicalMeshPosition: "", umbilicalMeshFixation: "" }), [
      "Mesh marked as used without mesh type. Add mesh type if available.",
      "Mesh marked as used without mesh position. Add mesh position if available.",
      "Mesh marked as used without fixation details. Add mesh fixation if available.",
    ]);
  });

  it("preserves the emergency laparotomy detail advisory branches", () => {
    const input = fixtureFor("emergency-laparotomy");
    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      drainStatus: "no",
      laparotomyBowelResectionPerformed: "yes",
      laparotomyBowelResectionDetails: "",
      laparotomyAnastomosisPerformed: "yes",
      laparotomyAnastomosisDetails: "",
      laparotomyStomaFormed: "yes",
      laparotomyStomaDetails: "",
      laparotomyTemporaryClosure: "yes",
      laparotomyTemporaryClosureDetails: "",
    }), [
      "Bowel resection marked as performed without details. Add resection details if available.",
      "Anastomosis marked as performed without details. Add anastomosis details if available.",
      "Stoma marked as formed without details. Add stoma details if available.",
      "Temporary abdominal closure marked as yes without details. Add closure details if available.",
    ]);
  });

  it("preserves shared warning order and the drain-location branch", () => {
    const input = fixtureFor("lap-appendicectomy");

    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      complications: "",
      specimen: "",
      drainStatus: "",
    }), [
      "No complications entered. Confirm that there were no immediate complications.",
      "No specimen entered. Confirm whether there was no specimen or add details.",
      "No drain status entered. Confirm whether no drain was placed or add details.",
    ]);

    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      drainStatus: "yes",
      drainLocation: "",
    }), [
      "Drain marked as yes without a location. Add drain location if available.",
    ]);
  });

  it("preserves both incision-and-drainage specimen branches", () => {
    const input = fixtureFor("incision-and-drainage");

    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      specimen: "",
      pusSwabSent: "no",
    }), [
      "No specimen or microbiology swab entered. Confirm whether a swab/specimen was sent.",
    ]);

    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      specimen: "",
      pusSwabSent: "yes",
    }), [
      "Microbiology swab marked as sent. Consider documenting the specimen/swab in the specimen field.",
    ]);
  });

  it("preserves the deliberate absence of a washout-detail warning for emergency laparotomy", () => {
    const input = fixtureFor("emergency-laparotomy");

    assertWarningsEqual(getAdvisoryWarnings({
      ...input,
      drainStatus: "no",
      laparotomyWashoutPerformed: "yes",
      laparotomyWashoutDetails: "",
    }), []);
  });
});

describe("plain-text boundary", () => {
  it("returns hostile user text literally as plain text rather than interpreting or escaping it as HTML", () => {
    const input = fixtureFor("lap-appendicectomy");
    const hostile = '<img src=x onerror="synthetic()">';
    const note = generateNote({ ...input, indication: hostile, findings: hostile }, "full");

    assert.ok(note.includes(`Indication:\n${hostile}`));
    assert.ok(note.includes(`Findings:\n${hostile}`));
    assert.ok(!note.includes("&lt;img"));
  });

  it("keeps the production domain free of browser and HTML-interpretation APIs", () => {
    const forbidden = /\b(?:document|window|localStorage|sessionStorage|fetch|clipboard|innerHTML|outerHTML|insertAdjacentHTML)\b/;

    for (const filePath of sourceFiles(join(process.cwd(), "src", "domain"))) {
      assert.doesNotMatch(readFileSync(filePath, "utf8"), forbidden, filePath);
    }
  });
});
