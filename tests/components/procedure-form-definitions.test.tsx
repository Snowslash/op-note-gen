import { fireEvent, render, screen } from "@testing-library/react";
import App from "../../src/app/App";
import { PROCEDURE_FORM_DEFINITIONS } from "../../src/app/procedure-form-definitions";
import { createProcedureInput } from "../../src/app/procedure-state";
import { PROCEDURE_DEFINITIONS } from "../../src/domain";

const procedures = Object.values(PROCEDURE_DEFINITIONS);

describe("per-procedure form definitions", () => {
  it.each(procedures)("$id targets real blank scalar answers, visibility dependencies and reset values", ({ id, specialty }) => {
    const input = createProcedureInput(id);
    const record = input as unknown as Record<string, unknown>;
    const fields = PROCEDURE_FORM_DEFINITIONS[id].fields;
    expect(new Set(fields.map((field) => field.field)).size).toBe(fields.length);
    for (const field of fields) {
      expect(Object.hasOwn(record, field.field)).toBe(true);
      expect(record[field.field]).toBe(field.kind === "checkbox" ? false : "");
      if (field.showWhen) {
        expect(Object.hasOwn(record, field.showWhen.field)).toBe(true);
        expect(typeof record[field.showWhen.field]).toBe(typeof field.showWhen.equals);
      }
      if ("clearRule" in field && field.clearRule) {
        expect(typeof record[field.field]).toBe(typeof field.clearRule.unless);
        for (const target of field.clearRule.fields) {
          expect(Object.hasOwn(record, target)).toBe(true);
          expect(record[target]).toEqual(Array.isArray(record[target]) ? [] : "");
        }
      }
    }
    const sameSpecialtyInputs = procedures.filter((procedure) => procedure.specialty === specialty).map((procedure) => createProcedureInput(procedure.id));
    const specificKeys = Object.keys(input).filter((key) => !sameSpecialtyInputs.every((other) => Object.hasOwn(other, key)));
    expect(specificKeys.filter((key) => !fields.some((field) => field.field === key))).toEqual([]);
  });

  it("clears custom drain controls without discarding retained general-surgery hidden answers", () => {
    const input = createProcedureInput("lap-appendicectomy");
    if (input.procedureId !== "lap-appendicectomy") throw new Error("Wrong fixture procedure");
    render(<App initialInput={{ ...input, indication: "Synthetic indication", findings: "Synthetic findings", contaminationPresent: "yes", contaminationDescription: "Synthetic retained detail" }} initialStage="Completion" />);
    fireEvent.click(screen.getByLabelText("Drain placed yes"));
    fireEvent.change(screen.getByLabelText("Drain location"), { target: { value: "Custom / other" } });
    fireEvent.change(screen.getByLabelText("Custom drain location"), { target: { value: "Synthetic cleared drain" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I have reviewed/ }));

    fireEvent.click(screen.getByRole("button", { name: "Completion" }));
    fireEvent.click(screen.getByLabelText("Drain placed no"));
    fireEvent.click(screen.getByLabelText("Drain placed yes"));
    expect(screen.getByLabelText("Custom drain location")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.click(screen.getByLabelText("Contamination present no"));
    expect(screen.queryByLabelText("Contamination description")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic cleared drain");
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic retained detail");
    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.click(screen.getByLabelText("Contamination present yes"));
    expect(screen.getByLabelText("Contamination description")).toHaveValue("Synthetic retained detail");
  });

  it("clears select-controlled mesh strings and requires regeneration before copy", () => {
    const input = createProcedureInput("open-inguinal-hernia-repair");
    if (input.procedureId !== "open-inguinal-hernia-repair") throw new Error("Wrong fixture procedure");
    render(<App initialInput={{ ...input, indication: "Synthetic indication", findings: "Synthetic findings", meshUsed: "yes", meshType: "Synthetic mesh", meshFixation: "Synthetic fixation" }} initialStage="Review and copy" />);
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I have reviewed/ }));
    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.change(screen.getByLabelText("Mesh used"), { target: { value: "no" } });
    expect(screen.queryByLabelText("Mesh type")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Mesh used"), { target: { value: "yes" } });
    expect(screen.getByLabelText("Mesh type")).toHaveValue("");
    expect(screen.getByLabelText("Mesh fixation")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic mesh");
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic fixation");
  });
});
