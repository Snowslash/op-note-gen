import { applyAnswerEdit, createDraftState, createProcedureInput, type NoteState } from "../../src/app/procedure-state";

function reviewedState(): NoteState {
  return {
    values: createProcedureInput("lap-appendicectomy"), outputMode: "handover",
    draft: { text: "Synthetic reviewed draft", warnings: ["Synthetic advisory"], fresh: true, reviewed: true },
    feedback: "Review confirmed. Copy is now available.",
  };
}

describe("atomic answer edits", () => {
  it("updates the latest input and invalidates review without discarding the previous draft", () => {
    const before = reviewedState();
    const snapshot = structuredClone(before);
    const after = applyAnswerEdit(before, { kind: "input", update: (values) => values && { ...values, findings: "Synthetic edited findings" } });
    expect(after.values?.findings).toBe("Synthetic edited findings");
    expect(after.outputMode).toBe("handover");
    expect(after.draft).toEqual({ ...before.draft, fresh: false, reviewed: false });
    expect(after.feedback).toBe("Form details changed after generation. Regenerate before copying.");
    expect(before).toEqual(snapshot);

    const second = applyAnswerEdit(after, { kind: "input", update: (values) => values && { ...values, surgeon: "Synthetic surgeon" } });
    expect(second.values?.findings).toBe("Synthetic edited findings");
    expect(second.values?.surgeon).toBe("Synthetic surgeon");
  });

  it("changes output mode and marks the old output stale with the existing mode feedback", () => {
    const before = reviewedState();
    const after = applyAnswerEdit(before, { kind: "output-mode", mode: "postOp" });
    expect(after.values).toBe(before.values);
    expect(after.outputMode).toBe("postOp");
    expect(after.draft).toEqual({ ...before.draft, fresh: false, reviewed: false });
    expect(after.feedback).toBe("Output mode changed. Regenerate before copying.");
  });

  it("resets mode, draft and feedback together when replacing the procedure", () => {
    const input = createProcedureInput("ankle-orif");
    expect(applyAnswerEdit(reviewedState(), { kind: "procedure", input })).toEqual({
      values: input, outputMode: "full", draft: createDraftState(), feedback: "",
    });
  });

  it("leaves an absent draft and its feedback alone while accepting an input edit", () => {
    const before: NoteState = { ...reviewedState(), draft: createDraftState(), feedback: "" };
    const after = applyAnswerEdit(before, { kind: "input", update: (values) => values && { ...values, indication: "Synthetic first indication" } });
    expect(after.values?.indication).toBe("Synthetic first indication");
    expect(after.draft).toBe(before.draft);
    expect(after.feedback).toBe("");
  });

  it("invalidates even an unchanged answer edit, preserving the pre-refactor event semantics", () => {
    const before = reviewedState();
    const after = applyAnswerEdit(before, { kind: "input", update: (values) => values });
    expect(after.values).toBe(before.values);
    expect(after.draft.fresh).toBe(false);
    expect(after.draft.reviewed).toBe(false);
  });

  it("makes generated but unreviewed text stale too", () => {
    const before = reviewedState();
    before.draft.reviewed = false;
    const after = applyAnswerEdit(before, { kind: "output-mode", mode: "full" });
    expect(after.draft).toEqual({ ...before.draft, fresh: false });
  });
});
