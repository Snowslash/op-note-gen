import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { ProcedurePicker } from "../../src/components/ProcedurePicker";
import { PROCEDURE_DEFINITIONS } from "../../src/domain";
import type { ProcedureId } from "../../src/domain";

const procedures = Object.values(PROCEDURE_DEFINITIONS);
function Picker() {
  const [selected, setSelected] = useState<ProcedureId | null>(null);
  const [search, setSearch] = useState("");
  return <ProcedurePicker selected={selected} search={search} onSearchChange={setSearch} onSelect={setSelected} />;
}
afterEach(cleanup);

it.each(procedures)("names $label from its title and describes its category", (procedure) => {
  render(<Picker />);
  if (procedure.specialty === "general-surgery") fireEvent.click(screen.getByRole("button", { name: "General surgery" }));
  const button = screen.getByRole("button", { name: procedure.label });
  expect(button).toHaveAccessibleDescription(procedure.category);
  expect(button).not.toHaveAttribute("aria-label");
  for (const [attribute, text] of [["aria-labelledby", procedure.label], ["aria-describedby", procedure.category]]) {
    const id = button.getAttribute(attribute);
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent(text);
    expect(button.contains(document.getElementById(id!))).toBe(true);
  }
  expect(button).toHaveAttribute("type", "button");
  expect(button).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-pressed", "true");
});

it("keeps IDs unique across picker mounts and stable through search and selection", () => {
  render(<><Picker /><Picker /></>);
  const regions = screen.getAllByRole("region", { name: "Procedure" });
  expect(regions).toHaveLength(2);
  for (const region of regions) {
    const scope = within(region);
    const search = scope.getByRole("searchbox", { name: "Search procedures" });
    const title = "Dynamic hip screw fixation";
    const button = scope.getByRole("button", { name: title });
    const ids = [button.getAttribute("aria-labelledby"), button.getAttribute("aria-describedby")];
    fireEvent.click(button);
    fireEvent.change(search, { target: { value: "Hip-fracture surgery" } });
    expect(scope.getByText("3 procedures match.")).toBeVisible();
    expect(button).toHaveAccessibleName(title);
    expect(button).toHaveAccessibleDescription("Hip-fracture surgery");
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(search, { target: { value: "no such procedure" } });
    expect(scope.getByText("0 procedures match.")).toBeVisible();
    fireEvent.change(search, { target: { value: "" } });
    const restored = scope.getByRole("button", { name: title });
    expect([restored.getAttribute("aria-labelledby"), restored.getAttribute("aria-describedby")]).toEqual(ids);
    expect(restored).toHaveAttribute("aria-pressed", "true");
  }
  const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
});
