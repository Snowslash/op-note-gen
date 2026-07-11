import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import expectedOutput from "../fixtures/v1/expected-output.json";
import App from "../../src/app/App";

const appendicectomyFixture = expectedOutput["lap-appendicectomy-full"];
const appendicectomyHandoverFixture = expectedOutput["lap-appendicectomy-full-handover"];

function selectAppendicectomy() {
  fireEvent.click(screen.getByRole("button", { name: "Laparoscopic appendicectomy" }));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

function fillCoreDetails() {
  fireEvent.change(screen.getByLabelText("Date/time"), { target: { value: "2026-06-01T08:05" } });
  fireEvent.change(screen.getByLabelText("Surgeon"), { target: { value: "Synthetic Surgeon A" } });
  fireEvent.change(screen.getByLabelText("Assistant"), { target: { value: "Synthetic Assistant B" } });
  fireEvent.change(screen.getByLabelText("Supervising consultant"), { target: { value: "Synthetic Consultant C" } });
  fireEvent.change(screen.getByLabelText("Anaesthetic"), { target: { value: "GA" } });
  fireEvent.change(screen.getByLabelText("Anaesthetist"), { target: { value: "Synthetic Anaesthetist D" } });
  fireEvent.click(screen.getByRole("button", { name: "Add team member" }));
  fireEvent.change(screen.getByLabelText("Team member name"), { target: { value: "Synthetic Additional Surgeon E" } });
  fireEvent.change(screen.getByLabelText("Team member role"), { target: { value: "Surgeon" } });
  fireEvent.click(screen.getByRole("button", { name: "Add team member" }));
  const teamMemberNames = screen.getAllByLabelText("Team member name");
  const teamMemberRoles = screen.getAllByLabelText("Team member role");
  expect(new Set(teamMemberNames.map((control) => control.id)).size).toBe(2);
  expect(new Set(teamMemberRoles.map((control) => control.id)).size).toBe(2);
  fireEvent.change(teamMemberNames[1], { target: { value: "Synthetic Additional Assistant F" } });
  fireEvent.change(teamMemberRoles[1], { target: { value: "Assistant" } });
  fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic acute appendicitis indication" } });
  fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic inflamed appendix with local contamination" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

function fillOperativeDetails() {
  fireEvent.change(screen.getByLabelText("Ports used / port configuration"), { target: { value: "Synthetic 10 mm umbilical and 5 mm left iliac fossa ports" } });
  fireEvent.change(screen.getByLabelText("Appendix appearance / operative findings"), { target: { value: "Synthetic inflamed non-perforated appendix" } });
  fireEvent.click(screen.getByLabelText("Perforation no"));
  fireEvent.click(screen.getByLabelText("Contamination present yes"));
  fireEvent.change(screen.getByLabelText("Contamination description"), { target: { value: "Synthetic local turbid fluid" } });
  fireEvent.change(screen.getByLabelText("Mesoappendix division method"), { target: { value: "LigaSure" } });
  fireEvent.change(screen.getByLabelText("Stump control method"), { target: { value: "Endoloops" } });
  fireEvent.click(screen.getByLabelText("Specimen removed in bag yes"));
  fireEvent.click(screen.getByLabelText("Washout performed yes"));
  expect(screen.queryByLabelText("Haemostasis confirmed yes")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Additional operative details"), { target: { value: "Synthetic additional appendicectomy detail" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

function fillCompletionDetails() {
  fireEvent.change(screen.getByLabelText("Specimen"), { target: { value: "Synthetic appendix" } });
  fireEvent.click(screen.getByLabelText("Drain placed no"));
  fireEvent.change(screen.getByLabelText("Estimated blood loss"), { target: { value: "10 mL" } });
  fireEvent.change(screen.getByLabelText("Complications"), { target: { value: "none" } });
  expect(screen.getByLabelText("Haemostasis confirmed yes")).toBeVisible();
  fireEvent.click(screen.getByLabelText("Haemostasis confirmed yes"));
  fireEvent.click(screen.getByLabelText("Fascial closure performed yes"));
  fireEvent.change(screen.getByLabelText("Fascial suture material"), { target: { value: "Synthetic 0 PDS" } });
  fireEvent.change(screen.getByLabelText("Skin closure method"), { target: { value: "Synthetic 4-0 Monocryl" } });
  fireEvent.change(screen.getByLabelText("Antibiotic prophylaxis"), { target: { value: "Synthetic antibiotic at induction" } });
  fireEvent.change(screen.getByLabelText("DVT prophylaxis"), { target: { value: "Synthetic mechanical prophylaxis" } });
  fireEvent.change(screen.getByLabelText("Post-operative care instructions"), { target: { value: "Synthetic ward observation and oral analgesia" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

function reachCompleteReview() {
  selectAppendicectomy();
  fillCoreDetails();
  fillOperativeDetails();
  fillCompletionDetails();
}

describe("appendicectomy vertical workflow", () => {
  it("has exactly five accessible stages, requires procedure selection, and validates the current stage only", () => {
    render(<App />);

    expect(screen.getAllByRole("button", { name: /^(Procedure|Core details|Operative details|Completion|Review and copy)$/ })).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Procedure" })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.queryByText("No complications entered. Confirm that there were no immediate complications.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Laparoscopic appendicectomy" }));
    expect(screen.getByRole("button", { name: "Laparoscopic appendicectomy" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Laparoscopic cholecystectomy" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Indication is required.");
    expect(screen.getByLabelText("Indication")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByLabelText("Appendix appearance / operative findings")).not.toBeInTheDocument();
  });

  it("uses local datetime semantics and clears conditional appendicectomy details when their controls change", () => {
    render(<App />);
    selectAppendicectomy();

    expect((screen.getByLabelText("Date/time") as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("Laparoscopic entry technique"), { target: { value: "Custom / other" } });
    fireEvent.change(screen.getByLabelText("Custom entry technique"), { target: { value: "Synthetic custom entry" } });
    fireEvent.change(screen.getByLabelText("Laparoscopic entry technique"), { target: { value: "Hasson" } });
    expect(screen.queryByLabelText("Custom entry technique")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Contamination present yes"));
    fireEvent.change(screen.getByLabelText("Contamination description"), { target: { value: "Synthetic contamination" } });
    fireEvent.click(screen.getByLabelText("Contamination present no"));
    expect(screen.queryByLabelText("Contamination description")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Converted to open"));
    fireEvent.change(screen.getByLabelText("Reason for conversion"), { target: { value: "Synthetic conversion reason" } });
    fireEvent.click(screen.getByLabelText("Converted to open"));
    expect(screen.queryByLabelText("Reason for conversion")).not.toBeInTheDocument();
  });

  it("generates the checked-in full appendicectomy fixture exactly and separates advisory warnings", () => {
    render(<App />);
    reachCompleteReview();

    expect(screen.getByRole("heading", { name: "Review and copy" })).toBeVisible();
    expect(screen.queryByText("Advisory warnings")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    expect(screen.getByText("Advisory warnings")).toBeVisible();
    expect(screen.getByTestId("generated-note").textContent).toBe(appendicectomyFixture);
    expect(screen.getByTestId("generated-note")).toHaveTextContent("Procedure: Laparoscopic appendicectomy");
    expect(screen.getByTestId("generated-note")).not.toHaveTextContent("STALE");
  });

  it("renders hostile form text as literal plain text rather than executable markup", () => {
    render(<App />);
    selectAppendicectomy();
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic indication" } });
    fireEvent.change(screen.getByLabelText("Findings"), { target: { value: "Synthetic findings" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Additional operative details"), { target: { value: "<img src=x onerror=alert(1)>" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    expect(screen.getByTestId("generated-note")).toHaveTextContent("<img src=x onerror=alert(1)>");
    expect(screen.getByTestId("generated-note").querySelector("img")).toBeNull();
  });

  it("requires a fresh reviewed draft before copying and invalidates it on a field edit or output-mode change", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<App />);
    reachCompleteReview();
    const review = screen.getByRole("checkbox", { name: /I have reviewed/ });
    expect(review).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));

    const copy = screen.getByRole("button", { name: "Copy to clipboard" });
    expect(review).toBeEnabled();
    expect(copy).toBeDisabled();
    fireEvent.click(review);
    expect(copy).toBeEnabled();
    fireEvent.click(copy);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(appendicectomyFixture));
    expect(screen.getByRole("status")).toHaveTextContent("Operation note copied to clipboard.");

    fireEvent.change(screen.getByLabelText("Output mode"), { target: { value: "handover" } });
    expect(screen.getByTestId("generated-note").textContent).toBe(appendicectomyFixture);
    expect(screen.getByText("Output mode changed. Regenerate before copying.")).toBeVisible();
    expect(review).not.toBeChecked();
    expect(review).toBeDisabled();
    expect(copy).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByTestId("generated-note").textContent).toBe(appendicectomyHandoverFixture);
    expect(review).toBeEnabled();
    fireEvent.click(review);
    fireEvent.click(screen.getByRole("button", { name: "Completion" }));
    fireEvent.change(screen.getByLabelText("Post-operative care instructions"), { target: { value: "Synthetic edited care instructions" } });
    fireEvent.click(screen.getByRole("button", { name: "Review and copy" }));
    expect(screen.getByText("Form details changed after generation. Regenerate before copying.")).toBeVisible();
    expect(screen.getByRole("checkbox", { name: /I have reviewed/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeDisabled();
  });

  it("keeps the note visible and gives manual fallback guidance when clipboard copying fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("synthetic clipboard rejection")) },
    });
    render(<App />);
    reachCompleteReview();
    fireEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I have reviewed/ }));
    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Clipboard copy failed. Please copy the note manually.");
    expect(screen.getByTestId("generated-note").textContent).toBe(appendicectomyFixture);
  });
});
