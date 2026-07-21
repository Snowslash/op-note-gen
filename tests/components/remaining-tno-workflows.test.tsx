import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/app/App";
import type {
  CephalomedullaryNailInput,
  DistalRadiusOrifInput,
  DynamicHipScrewInput,
  HipHemiarthroplastyInput,
} from "../../src/domain";
import { completeTnoCommon } from "../domain/tno-test-fixtures";

const completeHipHemiInput: HipHemiarthroplastyInput = {
  ...completeTnoCommon,
  procedureId: "hip-hemiarthroplasty",
  hemiApproach: "Anterolateral",
  hemiApproachAndIncisionDetails: "Synthetic approach",
  hemiCapsuleManagement: "Synthetic capsule detail",
  hemiFemoralHeadExcision: "Synthetic excision detail",
  hemiNativeHeadSize: "Synthetic size",
  hemiCanalPreparation: "Synthetic canal preparation",
  hemiStemFixation: "Cemented",
  hemiCementDetails: "Synthetic cement and cementing detail",
  hemiTrialAndReduction: "Synthetic trial and reduction",
  hemiStabilityAssessment: "Synthetic stability assessment",
  hemiLegLengthAndOffset: "Synthetic leg length assessment",
  hemiCapsuleAndAbductorRepair: "Synthetic repair",
};

const completeCmnInput: CephalomedullaryNailInput = {
  ...completeTnoCommon,
  procedureId: "cephalomedullary-nail",
  cmnFracturePattern: "Synthetic pattern",
  cmnReductionMethod: "Closed reduction",
  cmnReductionDetails: "Synthetic reduction",
  cmnEntryPointAndIncision: "Synthetic entry",
  cmnCanalPreparation: "Synthetic canal preparation",
  cmnNailInsertionDetails: "Synthetic nail insertion",
  cmnProximalFixationDetails: "Synthetic proximal fixation",
  cmnDistalLockingPerformed: "yes",
  cmnDistalLockingDetails: "Synthetic distal locking detail",
  cmnCompressionApplied: "no",
  cmnIrrigationDetails: "Synthetic irrigation",
};

const completeDistalRadiusInput: DistalRadiusOrifInput = {
  ...completeTnoCommon,
  procedureId: "distal-radius-orif",
  distalRadiusFracturePattern: "Synthetic pattern",
  distalRadiusApproach: "Volar",
  distalRadiusApproachAndIncision: "Synthetic approach",
  distalRadiusReductionDetails: "Synthetic reduction",
  distalRadiusFixationDetails: "Synthetic fixation",
  distalRadiusDrujAssessed: "yes",
  distalRadiusDrujDetails: "Synthetic DRUJ assessment findings",
  distalRadiusTendonAssessment: "Synthetic tendon assessment",
  distalRadiusIrrigationDetails: "Synthetic irrigation",
};

const pickerCases = [
  ["NOF", "Hip hemiarthroplasty for fracture", "Surgical approach"],
  ["DHS", "Dynamic hip screw fixation", "Fracture pattern"],
  ["nail", "Cephalomedullary nail fixation", "Fracture pattern"],
  ["wrist", "Open reduction and internal fixation of distal radius fracture", "Surgical approach"],
] as const;

describe("remaining T&O workflows", () => {
  it.each(pickerCases)("searches %s and opens the blank-safe %s workflow", (query, label, landmark) => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Search procedures"), { target: { value: query } });
    fireEvent.click(screen.getByRole("button", { name: label }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText("Operation date and time")).toHaveValue("");
    expect(screen.getByLabelText("Right")).not.toBeChecked();
    expect(screen.getByLabelText("Left")).not.toBeChecked();

    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });
    fireEvent.click(screen.getByLabelText("Right"));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText(landmark)).toBeVisible();
    fireEvent.click(screen.getByLabelText("Implants used yes"));
    expect(screen.getByRole("button", { name: "Add implant" })).toBeVisible();
  });

  it("offers the complete approved shared position set for hip hemiarthroplasty", () => {
    render(<App initialInput={completeHipHemiInput} initialStage="Operative details" />);
    expect(screen.getByRole("heading", { name: "Operative details" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Orthopaedic operative details" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Position / table set-up")).toHaveTextContent("Supine on traction table");
  });

  it("does not create a copyable DHS draft for compression with implants marked not used", () => {
    const contradictoryInput: DynamicHipScrewInput = {
      ...completeTnoCommon,
      procedureId: "dynamic-hip-screw",
      implantsUsed: "no",
      implants: [],
      dhsFracturePattern: "",
      dhsReductionMethod: "",
      dhsReductionDetails: "",
      dhsApproachAndIncision: "",
      dhsGuidewireAndLagScrewDetails: "",
      dhsPlateFixationDetails: "",
      dhsCompressionApplied: "yes",
      dhsIrrigationDetails: "",
    };

    render(<App initialInput={contradictoryInput} initialStage="Review and copy" />);
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    expect(screen.getByText("Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.")).toBeVisible();
    expect(screen.queryByTestId("generated-note")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy to clipboard" })).not.toBeInTheDocument();
  });

  it("clears hidden hemiarthroplasty cement details", () => {
    render(<App initialInput={completeHipHemiInput} initialStage="Operative details" />);
    expect(screen.getByLabelText("Cement and cementing details")).toHaveValue("Synthetic cement and cementing detail");
    fireEvent.click(screen.getByLabelText("Stem fixation Uncemented"));
    expect(screen.queryByLabelText("Cement and cementing details")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic cement and cementing detail");
  });

  it("clears hidden cephalomedullary distal-locking details", () => {
    render(<App initialInput={completeCmnInput} initialStage="Operative details" />);
    expect(screen.getByLabelText("Distal locking details")).toHaveValue("Synthetic distal locking detail");
    fireEvent.click(screen.getByLabelText("Distal locking performed no"));
    expect(screen.queryByLabelText("Distal locking details")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic distal locking detail");
  });

  it("clears hidden distal-radius DRUJ findings", () => {
    render(<App initialInput={completeDistalRadiusInput} initialStage="Operative details" />);
    expect(screen.getByLabelText("Distal radioulnar joint assessment findings")).toHaveValue("Synthetic DRUJ assessment findings");
    fireEvent.click(screen.getByLabelText("Distal radioulnar joint assessed no"));
    expect(screen.queryByLabelText("Distal radioulnar joint assessment findings")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("Synthetic DRUJ assessment findings");
  });
});
