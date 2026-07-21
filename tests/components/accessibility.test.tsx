import axe from "axe-core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "../../src/app/App";
import { PROCEDURE_DEFINITIONS } from "../../src/domain";
import { createProcedureInput } from "../../src/app/procedure-state";

async function expectNoStructuralViolations() {
  const results = await axe.run(document.body, {
    rules: {
      "color-contrast": { enabled: false },
    },
  });
  expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.flatMap((node) => node.target) }))).toEqual([]);
}

describe("automated accessibility acceptance", () => {
  afterEach(() => cleanup());

  it("passes axe on the procedure picker", async () => {
    render(<App />);
    await expectNoStructuralViolations();
  });

  it.each(Object.values(PROCEDURE_DEFINITIONS))("passes axe on the $label operative form", async (procedure) => {
    const input = createProcedureInput(procedure.id);
    input.indication = "Synthetic indication";
    input.findings = "Synthetic findings";
    render(<App initialInput={input} initialStage="Operative details" />);
    await expectNoStructuralViolations();
  });

  it("passes axe with two accessible repeatable implant rows", async () => {
    const input = createProcedureInput("dynamic-hip-screw");
    if (!("implants" in input)) {
      throw new Error("Expected an orthopaedic procedure input");
    }
    input.indication = "Synthetic indication";
    input.findings = "Synthetic findings";
    input.implantsUsed = "yes";
    input.implants = [
      { id: "synthetic-implant-1", component: "", manufacturer: "", productOrSystem: "", size: "", lotSerialOrReference: "" },
      { id: "synthetic-implant-2", component: "", manufacturer: "", productOrSystem: "", size: "", lotSerialOrReference: "" },
    ];

    render(<App initialInput={input} initialStage="Operative details" />);

    expect(screen.getByRole("group", { name: "Implant 1" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Implant 2" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Implant 1 component" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Implant 2 component" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Move implant 1 up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move implant 2 down" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move implant 1 down" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Move implant 2 up" })).toBeEnabled();
    await expectNoStructuralViolations();
  });

  it("passes axe on generated review and copy controls", async () => {
    const input = createProcedureInput("lap-appendicectomy");
    input.indication = "Synthetic indication";
    input.findings = "Synthetic findings";
    render(<App initialInput={input} initialStage="Review and copy" />);
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    await expectNoStructuralViolations();
  });
});
