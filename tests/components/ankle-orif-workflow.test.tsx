import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/app/App";
import type { AnkleOrifInput } from "../../src/domain";

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
    { id: "implant-test-1", component: "Fibular plate", manufacturer: "Synthetic Manufacturer", productOrSystem: "Synthetic Ankle System", size: "6-hole", lotSerialOrReference: "SYN-REF-001" },
    { id: "implant-test-2", component: "Syndesmosis screw", manufacturer: "", productOrSystem: "", size: "", lotSerialOrReference: "SYN-REF-002" },
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

function chooseRadio(groupName: string, optionName: string) {
  const group = screen.getByRole("group", { name: groupName });
  fireEvent.click(within(group).getByLabelText(`${groupName} ${optionName.toLowerCase()}`));
}

describe("ankle ORIF v2 workflow", () => {
  it("puts T&O first in an accessible specialty accordion and opens matching search results", () => {
    render(<App />);

    const specialtyHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(specialtyHeadings.map((heading) => heading.textContent)).toEqual([
      "Trauma and orthopaedics",
      "General surgery",
    ]);
    const tnoTrigger = screen.getByRole("button", { name: "Trauma and orthopaedics" });
    const generalTrigger = screen.getByRole("button", { name: "General surgery" });
    expect(tnoTrigger).toHaveAttribute("aria-expanded", "true");
    expect(generalTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Open reduction and internal fixation of ankle fracture" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Laparoscopic appendicectomy" })).not.toBeInTheDocument();

    fireEvent.click(generalTrigger);
    expect(generalTrigger).toHaveAttribute("aria-expanded", "true");
    expect(tnoTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Laparoscopic appendicectomy" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Open reduction and internal fixation of ankle fracture" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search procedures"), { target: { value: "ORIF" } });
    expect(screen.queryByRole("heading", { name: "General surgery" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trauma and orthopaedics" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Trauma and orthopaedics" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Open reduction and internal fixation of ankle fracture" })).toBeVisible();
  });

  it("uses blank-safe T&O controls, clears hidden dependencies and renders the orthopaedic completion profile", () => {
    render(<App initialInput={completeAnkleInput} initialStage="Core details" />);

    expect(screen.getByLabelText("Operation date and time")).toHaveValue("2026-07-20T14:35");
    expect(screen.getByLabelText("Case classification")).toBeVisible();
    expect(screen.getByRole("group", { name: "Side" })).toBeVisible();
    expect(screen.getByLabelText("Operative diagnosis")).toHaveValue("Synthetic closed unstable right ankle fracture");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("heading", { name: "Ankle ORIF details" })).toBeVisible();
    expect(screen.getByLabelText("Tourniquet site")).toHaveValue("Right thigh");
    chooseRadio("Tourniquet used", "No");
    expect(screen.queryByLabelText("Tourniquet site")).not.toBeInTheDocument();
    chooseRadio("Tourniquet used", "Yes");
    expect(screen.getByLabelText("Tourniquet site")).toHaveValue("");

    expect(screen.getByLabelText("Implant 1 component")).toHaveValue("Fibular plate");
    chooseRadio("Implants used", "No");
    expect(screen.queryByLabelText("Implant 1 component")).not.toBeInTheDocument();
    chooseRadio("Implants used", "Yes");
    expect(screen.queryByLabelText("Implant 1 component")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add implant" }));
    expect(screen.getByLabelText("Implant 1 component")).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "Completion" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Orthopaedic completion details" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Specimens / samples")).toBeVisible();
    expect(screen.getByLabelText("Closure details")).toBeVisible();
    expect(screen.getByLabelText("Dressing / immobilisation")).toBeVisible();
    expect(screen.queryByText("Drain placed")).not.toBeInTheDocument();
    expect(screen.queryByText("Fascial closure performed")).not.toBeInTheDocument();
  });

  it("generates the ankle note and makes implant edits revoke review and copy approval", () => {
    render(<App initialInput={completeAnkleInput} initialStage="Review and copy" />);

    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    const note = screen.getByTestId("generated-note");
    expect(note).toHaveTextContent("Procedure: Open reduction and internal fixation of ankle fracture");
    expect(note).toHaveTextContent("SYN-REF-001");

    fireEvent.click(screen.getByLabelText("I have reviewed this generated draft and it reflects the current form entries."));
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.change(screen.getByLabelText("Implant 1 component"), { target: { value: "Edited fibular plate" } });
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));

    expect(screen.getByText("Draft is stale")).toBeVisible();
    expect(screen.getByLabelText("I have reviewed this generated draft and it reflects the current form entries.")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeDisabled();
  });

  it("invalidates generated review after implant add, remove and reorder, preserving visible output order", () => {
    render(<App initialInput={completeAnkleInput} initialStage="Review and copy" />);

    const generateAndReview = () => {
      fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
      fireEvent.click(screen.getByLabelText("I have reviewed this generated draft and it reflects the current form entries."));
      expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeEnabled();
    };
    const expectStaleReview = () => {
      expect(screen.getByText("Draft is stale")).toBeVisible();
      expect(screen.getByLabelText("I have reviewed this generated draft and it reflects the current form entries.")).not.toBeChecked();
      expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeDisabled();
    };

    generateAndReview();
    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.click(screen.getByRole("button", { name: "Add implant" }));
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));
    expectStaleReview();

    generateAndReview();
    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove implant 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));
    expectStaleReview();

    generateAndReview();
    fireEvent.click(screen.getByRole("button", { name: "Operative details" }));
    fireEvent.click(screen.getByRole("button", { name: "Move implant 2 up" }));
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));
    expectStaleReview();

    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    const reorderedNote = screen.getByTestId("generated-note").textContent ?? "";
    expect(reorderedNote.indexOf("SYN-REF-002")).toBeLessThan(reorderedNote.indexOf("SYN-REF-001"));
  });

  it("resets the complete input when changing away from and back to ankle ORIF", () => {
    render(<App initialInput={completeAnkleInput} initialStage="Operative details" />);

    fireEvent.click(screen.getByRole("button", { name: "Procedure" }));
    fireEvent.click(screen.getByRole("button", { name: "General surgery" }));
    fireEvent.click(screen.getByRole("button", { name: "Laparoscopic appendicectomy" }));
    fireEvent.click(screen.getByRole("button", { name: "Trauma and orthopaedics" }));
    fireEvent.click(screen.getByRole("button", { name: "Open reduction and internal fixation of ankle fracture" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText("Operation date and time")).toHaveValue("");
    expect(screen.getByLabelText("Indication")).toHaveValue("");
    expect(screen.getByLabelText("Findings")).toHaveValue("");
    expect(screen.queryByText("Synthetic Surgeon A")).not.toBeInTheDocument();
  });

  it("blocks progression from core details until side is explicitly selected", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Open reduction and internal fixation of ankle fracture" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByLabelText("Operation date and time")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("heading", { name: "Core details" })).toBeVisible();
    expect(screen.getAllByText("Side is required.")).toHaveLength(2);
  });

  it("routes contradictory implant and fixation data back to the operative stage", () => {
    render(<App initialInput={{ ...completeAnkleInput, implantsUsed: "no" }} initialStage="Review and copy" />);

    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    expect(screen.getByRole("heading", { name: "Ankle ORIF details" })).toBeVisible();
    expect(screen.getByText("Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.")).toBeVisible();
  });
});
