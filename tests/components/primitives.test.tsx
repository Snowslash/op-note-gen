import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import App from "../../src/app/App";
import { Alert } from "../../src/components/ui/alert";
import { Button } from "../../src/components/ui/button";
import { Checkbox } from "../../src/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../src/components/ui/collapsible";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../src/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select";
import { Textarea } from "../../src/components/ui/textarea";

function SelectHarness() {
  const [value, setValue] = useState("full");

  return (
    <>
      <Label htmlFor="output-mode">Output mode</Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id="output-mode">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full">Full note</SelectItem>
          <SelectItem value="handover">Handover</SelectItem>
        </SelectContent>
      </Select>
      <output data-testid="select-value">{value}</output>
    </>
  );
}

function RadioGroupHarness() {
  const [value, setValue] = useState("general");

  return (
    <>
      <RadioGroup value={value} onValueChange={setValue} aria-label="Anaesthetic">
        <RadioGroupItem id="general" value="general" />
        <Label htmlFor="general">General</Label>
        <RadioGroupItem id="regional" value="regional" />
        <Label htmlFor="regional">Regional</Label>
      </RadioGroup>
      <output data-testid="radio-value">{value}</output>
    </>
  );
}

function CheckboxHarness() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Checkbox id="reviewed" checked={checked} onCheckedChange={(nextChecked) => setChecked(nextChecked === true)} />
      <Label htmlFor="reviewed">Reviewed</Label>
      <output data-testid="checkbox-value">{String(checked)}</output>
    </>
  );
}

function CollapsibleHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger>More information</CollapsibleTrigger>
        <CollapsibleContent>Disclosure content</CollapsibleContent>
      </Collapsible>
      <output data-testid="collapsible-value">{String(open)}</output>
    </>
  );
}

describe("v2 app shell", () => {
  it("renders the required privacy and safety foundation with the appendicectomy workflow entry point", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Operation Note Generator" })).toBeVisible();
    expect(screen.getByText("Do not enter patient-identifiable information.")).toBeVisible();
    expect(
      screen.getByText("This tool runs entirely in your browser. No entered data is transmitted or stored by this site."),
    ).toBeVisible();
    expect(screen.getByText("Review generated text carefully before use in any clinical record.")).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Workflow stages" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Laparoscopic appendicectomy" })).toBeVisible();
  });
});

describe("owned shadcn primitives", () => {
  it("keeps button and text controls labelled and disabled when requested", () => {
    const onClick = vi.fn();

    render(
      <div>
        <Button onClick={onClick}>Continue</Button>
        <Button disabled onClick={onClick}>Disabled</Button>
        <Label htmlFor="indication">Indication</Label>
        <Input id="indication" />
        <Label htmlFor="details">Details</Label>
        <Textarea id="details" />
        <Alert>Review this draft before use.</Alert>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Indication" })).toHaveAttribute("id", "indication");
    expect(screen.getByRole("textbox", { name: "Details" })).toHaveAttribute("id", "details");
    expect(screen.getByRole("alert")).toHaveTextContent("Review this draft before use.");
  });

  it("uses the controlled Radix select API with keyboard selection", async () => {
    render(<SelectHarness />);

    const trigger = screen.getByRole("combobox", { name: "Output mode" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Handover" }));

    expect(screen.getByTestId("select-value")).toHaveTextContent("handover");
    expect(trigger).toHaveTextContent("Handover");
  });

  it("uses Radix radio-group controlled values with accessible radio semantics", async () => {
    render(<RadioGroupHarness />);

    const general = screen.getByRole("radio", { name: "General" });
    expect(general).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Regional" }));

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Regional" })).toBeChecked();
      expect(screen.getByTestId("radio-value")).toHaveTextContent("regional");
    });
  });

  it("uses Radix checkbox and collapsible controlled accessibility state", () => {
    render(
      <div>
        <CheckboxHarness />
        <CollapsibleHarness />
        <Checkbox id="disabled-checkbox" disabled aria-label="Disabled review" />
      </div>,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Reviewed" });
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByTestId("checkbox-value")).toHaveTextContent("true");

    const trigger = screen.getByRole("button", { name: "More information" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("collapsible-value")).toHaveTextContent("true");
    expect(screen.getByText("Disclosure content")).toBeVisible();

    const disabled = screen.getByRole("checkbox", { name: "Disabled review" });
    fireEvent.click(disabled);
    expect(disabled).toBeDisabled();
    expect(disabled).not.toBeChecked();
  });
});