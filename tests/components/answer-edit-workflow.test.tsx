import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/app/App";
import { createProcedureInput } from "../../src/app/procedure-state";
import type { WorkflowStage } from "../../src/app/workflow/stages";

function appendicectomyInput() {
  const input = createProcedureInput("lap-appendicectomy");
  if (input.procedureId !== "lap-appendicectomy") throw new Error("Wrong fixture procedure");
  return {
    ...input,
    indication: "Synthetic indication", findings: "Synthetic findings",
    operationDateTime: "2026-06-01T08:05",
    additionalTeamMembers: [{ id: "team-1", role: "Assistant", name: "Synthetic assistant" }],
    entryTechnique: "Synthetic custom entry", contaminationPresent: "yes",
    contaminationDescription: "Synthetic retained contamination", convertedToOpen: true,
    conversionReason: "Synthetic conversion", drainStatus: "yes", drainLocation: "Synthetic drain",
  };
}

function ankleInput() {
  const input = createProcedureInput("ankle-orif");
  if (input.procedureId !== "ankle-orif") throw new Error("Wrong fixture procedure");
  return {
    ...input, indication: "Synthetic indication", findings: "Synthetic findings", side: "Right", implantsUsed: "yes",
    implants: [
      { id: "implant-1", component: "Synthetic plate", manufacturer: "", productOrSystem: "", size: "", lotSerialOrReference: "SYN-001" },
      { id: "implant-2", component: "Synthetic screw", manufacturer: "", productOrSystem: "", size: "", lotSerialOrReference: "SYN-002" },
    ],
  };
}

const change = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const review = () => screen.getByRole("checkbox", { name: /I have reviewed/ });
const copy = () => screen.getByRole("button", { name: "Copy to clipboard" });

const editCases: { name: string; stage: WorkflowStage; edit: () => void; ankle?: boolean; expected?: string }[] = [
  { name: "core scalar", stage: "Core details", edit: () => change("Surgeon", "Synthetic edited surgeon"), expected: "Synthetic edited surgeon" },
  { name: "team add", stage: "Core details", edit: () => click("Add team member") },
  { name: "team name", stage: "Core details", edit: () => change("Team member name", "Synthetic edited assistant"), expected: "Synthetic edited assistant" },
  { name: "team role", stage: "Core details", edit: () => change("Team member role", "Surgeon"), expected: "Additional team members: Surgeon Synthetic assistant" },
  { name: "team remove", stage: "Core details", edit: () => click("Remove") },
  { name: "operative textarea", stage: "Operative details", edit: () => change("Additional operative details", "Synthetic edited detail"), expected: "Synthetic edited detail" },
  { name: "radio hides retained details", stage: "Operative details", edit: () => fireEvent.click(screen.getByLabelText("Contamination present no")) },
  { name: "checkbox clears details", stage: "Operative details", edit: () => fireEvent.click(screen.getByLabelText("Converted to open")) },
  { name: "custom choice", stage: "Operative details", edit: () => change("Laparoscopic entry technique", "Hasson"), expected: "Hasson" },
  { name: "custom text", stage: "Operative details", edit: () => change("Custom entry technique", "Synthetic edited entry"), expected: "Synthetic edited entry" },
  { name: "completion scalar", stage: "Completion", edit: () => change("Post-operative care instructions", "Synthetic edited plan"), expected: "Synthetic edited plan" },
  { name: "drain choice", stage: "Completion", edit: () => change("Drain location", "Pelvis"), expected: "Pelvis" },
  { name: "drain custom text", stage: "Completion", edit: () => change("Custom drain location", "Synthetic edited drain"), expected: "Synthetic edited drain" },
  { name: "drain status", stage: "Completion", edit: () => fireEvent.click(screen.getByLabelText("Drain placed no")) },
  { name: "implant add", stage: "Operative details", ankle: true, edit: () => click("Add implant") },
  { name: "implant change", stage: "Operative details", ankle: true, edit: () => change("Implant 1 component", "Synthetic edited implant"), expected: "Synthetic edited implant" },
  { name: "implant remove", stage: "Operative details", ankle: true, edit: () => click("Remove implant 1") },
  { name: "implant reorder", stage: "Operative details", ankle: true, edit: () => click("Move implant 2 up") },
  { name: "implant array clearing", stage: "Operative details", ankle: true, edit: () => fireEvent.click(screen.getByLabelText("Implants used no")) },
  { name: "output mode", stage: "Review and copy", edit: () => change("Output mode", "postOp"), expected: "Post-operative plan" },
];

describe("answer edits preserve the current review contract", () => {
  it.each(editCases)("$name revokes review until regeneration and a new confirmation", async ({ stage, edit, ankle, expected }) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<App initialInput={ankle ? ankleInput() : appendicectomyInput()} initialStage="Review and copy" />);
    expect(copy()).toBeDisabled();
    click("Generate draft");
    expect(copy()).toBeDisabled();
    fireEvent.click(review());
    expect(copy()).toBeEnabled();
    const oldText = screen.getByTestId("generated-note").textContent;

    click(stage);
    edit();
    click("Review and copy");
    expect(screen.getByTestId("generated-note").textContent).toBe(oldText);
    expect(screen.getByText("Draft is stale")).toBeVisible();
    expect(review()).not.toBeChecked();
    expect(review()).toBeDisabled();
    expect(copy()).toBeDisabled();
    fireEvent.click(copy());
    expect(writeText).not.toHaveBeenCalled();

    click("Generate draft");
    expect(review()).not.toBeChecked();
    expect(review()).toBeEnabled();
    expect(copy()).toBeDisabled();
    if (expected) expect(screen.getByTestId("generated-note").textContent).toContain(expected);
    fireEvent.click(review());
    fireEvent.click(copy());
    await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(screen.getByTestId("generated-note").textContent));
  });

  it("resets answers, mode, custom controls and the draft on a different procedure", () => {
    render(<App initialInput={appendicectomyInput()} initialOutputMode="handover" initialStage="Review and copy" />);
    click("Generate draft");
    fireEvent.click(review());
    click("Operative details");
    change("Laparoscopic entry technique", "Custom / other");
    change("Custom entry technique", "Synthetic temporary entry");
    click("Procedure");
    click("Laparoscopic cholecystectomy");
    click("Next");
    expect(screen.getByLabelText("Indication")).toHaveValue("");
    expect(screen.queryByLabelText("Team member name")).not.toBeInTheDocument();
    change("Indication", "Synthetic new indication");
    change("Findings", "Synthetic new findings");
    click("Next");
    expect(screen.getByLabelText("Laparoscopic entry technique")).toHaveValue("");
    expect(screen.queryByLabelText("Custom entry technique")).not.toBeInTheDocument();
    click("Next");
    click("Next");
    expect(screen.getByLabelText("Output mode")).toHaveValue("full");
    expect(screen.queryByTestId("generated-note")).not.toBeInTheDocument();
    expect(review()).toBeDisabled();
    expect(copy()).toBeDisabled();
  });

  it("does not invalidate on navigation, search or reselecting the current procedure", () => {
    render(<App initialInput={appendicectomyInput()} initialStage="Review and copy" />);
    click("Generate draft");
    fireEvent.click(review());
    const original = screen.getByTestId("generated-note").textContent;
    click("Core details");
    click("Procedure");
    change("Search procedures", "appendix");
    click("Laparoscopic appendicectomy");
    click("Review and copy");
    expect(copy()).toBeEnabled();
    expect(review()).toBeChecked();
    expect(screen.getByTestId("generated-note").textContent).toBe(original);
    expect(screen.getByTestId("generated-note").tagName).toBe("PRE");
    expect(screen.getByTestId("generated-note")).not.toHaveAttribute("contenteditable");
  });

  it("keeps manual-copy fallback text visible when the clipboard API is absent", () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    render(<App initialInput={appendicectomyInput()} initialStage="Review and copy" />);
    click("Generate draft");
    fireEvent.click(review());
    const original = screen.getByTestId("generated-note").textContent;
    fireEvent.click(copy());
    expect(screen.getByText("Clipboard copy is unavailable. Please copy the note manually.")).toHaveAttribute("role", "status");
    expect(screen.getByTestId("generated-note").textContent).toBe(original);
  });
});
