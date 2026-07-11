const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { generateNote } = require("./helpers/v1-browser-harness");
const fixtures = require("./fixtures/v1/fixture-inputs");

const EXPECTED_OUTPUT_PATH = path.join(__dirname, "fixtures", "v1", "expected-output.json");

function loadExpectedOutputs() {
  return JSON.parse(fs.readFileSync(EXPECTED_OUTPUT_PATH, "utf8"));
}

function countLinesStartingWith(note, prefix) {
  return note.split("\n").filter((line) => line.startsWith(prefix)).length;
}

function testAppendicectomyFullNoteMatchesCapturedV1Fixture(expectedOutputs) {
  const fixture = fixtures.find((candidate) => candidate.id === "lap-appendicectomy-full");
  const actual = generateNote(fixture.input, fixture.mode);

  assert.strictEqual(actual, expectedOutputs[fixture.id]);
}

function testEveryCapturedFixtureMatchesItsLiteralExpectedOutput(expectedOutputs) {
  assert.strictEqual(fixtures.length, 23, "Expected 21 procedure/mode fixtures plus two regression fixtures.");
  assert.deepStrictEqual(
    Object.keys(expectedOutputs).sort(),
    fixtures.map((fixture) => fixture.id).sort(),
    "Expected checked-in output fixtures to match the input fixture IDs exactly.",
  );

  fixtures.forEach((fixture) => {
    const actual = generateNote(fixture.input, fixture.mode);

    assert.strictEqual(actual, expectedOutputs[fixture.id], `v1 output drifted for ${fixture.id}.`);
    fixture.absent.forEach((text) => {
      assert.ok(!actual.includes(text), `Expected ${fixture.id} to omit ${JSON.stringify(text)}.`);
    });
    Object.entries(fixture.counts).forEach(([prefix, expectedCount]) => {
      assert.strictEqual(
        countLinesStartingWith(actual, prefix),
        expectedCount,
        `Expected ${fixture.id} to contain ${expectedCount} line(s) starting with ${prefix}.`,
      );
    });
  });
}

function testEveryProcedureHasAllThreeCapturedOutputModes() {
  const procedureIds = [
    "lapAppendicectomy",
    "lapCholecystectomy",
    "diagnosticLaparoscopy",
    "incisionAndDrainage",
    "openInguinalHerniaRepair",
    "openUmbilicalHerniaRepair",
    "emergencyLaparotomy",
  ];

  procedureIds.forEach((procedureId) => {
    const modes = fixtures
      .filter((fixture) => fixture.procedureModeCoverage && fixture.input.values.procedureSelect === procedureId)
      .map((fixture) => fixture.mode)
      .sort();

    assert.deepStrictEqual(modes, ["full", "handover", "postOp"]);
  });
}

function testFullNotesKeepSharedSectionsToOneLineAndKeepIdPackingDistinct() {
  fixtures.filter((fixture) => fixture.mode === "full").forEach((fixture) => {
    const note = generateNote(fixture.input, fixture.mode);

    ["Drain:", "Complications:", "Closure:"].forEach((prefix) => {
      assert.strictEqual(
        countLinesStartingWith(note, prefix),
        1,
        `Expected ${fixture.id} to contain one global ${prefix} line.`,
      );
    });

    if (fixture.input.values.procedureSelect === "incisionAndDrainage") {
      assert.strictEqual(countLinesStartingWith(note, "Packing/drain:"), 1);
      assert.strictEqual(countLinesStartingWith(note, "Drain:"), 1);
    }
  });
}

function testCapturedRegressionsAreExplicit() {
  const expectedOutputs = loadExpectedOutputs();
  const appendicectomy = expectedOutputs["lap-appendicectomy-full"];

  assert.match(appendicectomy, /^Date\/time: 01\/06\/2026, 08:05$/m);
  assert.match(appendicectomy, /^Additional team members: Surgeon Synthetic Additional Surgeon E; Assistant Synthetic Additional Assistant F$/m);
  assert.ok(!appendicectomy.includes("Assistant    "));
  assert.match(appendicectomy, /^Complications: No immediate complications\.$/m);
  assert.match(expectedOutputs["lap-cholecystectomy-full"], /^Complications: No immediate complications\.$/m);
  assert.match(expectedOutputs["lap-appendicectomy-none-case-punctuation-full"], /^Complications: No immediate complications\.$/m);
  assert.match(expectedOutputs["lap-appendicectomy-unspecified-full"], /^Date\/time: not specified$/m);
  assert.match(expectedOutputs["lap-appendicectomy-unspecified-full"], /^Complications: not specified$/m);

  fixtures
    .filter((fixture) => fixture.procedureModeCoverage && fixture.mode === "full")
    .forEach((fixture) => {
      assert.match(expectedOutputs[fixture.id], /^Date\/time: \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/m);
    });
}

// This suite captures generator output only. Warning/validation and UI state-transition
// coverage remains intentionally separate in tests/procedure-smoke.test.js.
const expectedOutputs = loadExpectedOutputs();
testAppendicectomyFullNoteMatchesCapturedV1Fixture(expectedOutputs);
testEveryCapturedFixtureMatchesItsLiteralExpectedOutput(expectedOutputs);
testEveryProcedureHasAllThreeCapturedOutputModes();
testFullNotesKeepSharedSectionsToOneLineAndKeepIdPackingDistinct();
testCapturedRegressionsAreExplicit();
console.log("v1 parity fixture tests passed");