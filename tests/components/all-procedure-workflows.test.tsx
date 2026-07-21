import { createRequire } from "node:module";
import { fireEvent, render, screen } from "@testing-library/react";
import expectedOutputJson from "../fixtures/v1/expected-output.json";
import App from "../../src/app/App";
import type { OutputMode, ProcedureId } from "../../src/domain";
import { PROCEDURE_DEFINITIONS } from "../../src/domain";
import { adaptLegacyFixtureInput, type LegacyFixtureInput } from "../domain/v1-fixture-adapter";

interface LegacyFixture {
  id: string;
  input: LegacyFixtureInput;
  mode: OutputMode;
  procedureModeCoverage?: boolean;
}

const require = createRequire(import.meta.url);
const fixtures = (require("../fixtures/v1/fixture-inputs.js") as LegacyFixture[]).filter((fixture) => fixture.procedureModeCoverage);
const expectedOutput = expectedOutputJson as Record<string, string>;

const operativeLandmark: Record<ProcedureId, string> = {
  "lap-appendicectomy": "Appendix appearance / operative findings",
  "lap-cholecystectomy": "Gallbladder appearance / operative findings",
  "diagnostic-laparoscopy": "Abdominal survey",
  "incision-and-drainage": "Abscess / incision site",
  "open-inguinal-hernia-repair": "Hernia side",
  "open-umbilical-hernia-repair": "Hernia defect size",
  "emergency-laparotomy": "Laparotomy incision",
  "ankle-orif": "Fracture pattern",
  "hip-hemiarthroplasty": "Surgical approach",
  "dynamic-hip-screw": "Guidewire and lag-screw placement",
  "cephalomedullary-nail": "Nail insertion details",
  "distal-radius-orif": "Surgical approach",
};

describe("all-procedure workflow parity", () => {
  it.each(fixtures)("renders $id byte-for-byte through the React review stage", (fixture) => {
    render(
      <App
        initialInput={adaptLegacyFixtureInput(fixture.input)}
        initialOutputMode={fixture.mode}
        initialStage="Review and copy"
      />,
    );

    expect(screen.getByRole("checkbox", { name: /I have reviewed/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    expect(screen.getByTestId("generated-note").textContent).toBe(expectedOutput[fixture.id]);
    expect(screen.getByRole("checkbox", { name: /I have reviewed/ })).toBeEnabled();
  });

  it.each(Object.values(PROCEDURE_DEFINITIONS))("selects $label and renders its operative workflow", (procedure) => {
    render(<App />);

    if (procedure.specialty === "general-surgery") {
      fireEvent.click(screen.getByRole("button", { name: "General surgery" }));
    }
    fireEvent.click(screen.getByRole("button", { name: procedure.label }));
    expect(screen.getByRole("button", { name: procedure.label })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });
    if (procedure.completionProfile === "orthopaedics") fireEvent.click(screen.getByLabelText("Right"));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText(operativeLandmark[procedure.id])).toBeVisible();
  });

  it("preserves and clears dependent details according to the v1 rules", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "General surgery" }));
    fireEvent.click(screen.getByRole("button", { name: "Laparoscopic cholecystectomy" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("Cystic duct control"), { target: { value: "Custom / other" } });
    fireEvent.change(screen.getByLabelText("Custom cystic duct control"), { target: { value: "Synthetic custom control" } });
    fireEvent.change(screen.getByLabelText("Cystic duct control"), { target: { value: "Clips" } });
    fireEvent.change(screen.getByLabelText("Cystic duct control"), { target: { value: "Custom / other" } });
    expect(screen.getByLabelText("Custom cystic duct control")).toHaveValue("");

    fireEvent.click(screen.getByLabelText("Bile spillage yes"));
    fireEvent.change(screen.getByLabelText("Bile spillage details"), { target: { value: "Synthetic retained detail" } });
    fireEvent.click(screen.getByLabelText("Bile spillage no"));
    expect(screen.queryByLabelText("Bile spillage details")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Bile spillage yes"));
    expect(screen.getByLabelText("Bile spillage details")).toHaveValue("Synthetic retained detail");
  });

  it("clears emergency laparotomy details when a yes/no controller hides them", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "General surgery" }));
    fireEvent.click(screen.getByRole("button", { name: "Emergency laparotomy" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("Bowel resection performed"), { target: { value: "yes" } });
    fireEvent.change(screen.getByLabelText("Bowel resection details"), { target: { value: "Synthetic resection detail" } });
    fireEvent.change(screen.getByLabelText("Bowel resection performed"), { target: { value: "no" } });
    expect(screen.queryByLabelText("Bowel resection details")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Bowel resection performed"), { target: { value: "yes" } });
    expect(screen.getByLabelText("Bowel resection details")).toHaveValue("");
  });
});
