// Compiled by tsconfig.app.json / npm run build; not a Vitest runtime suite.
import { PROCEDURE_FORM_DEFINITIONS } from "../../src/app/procedure-form-definitions";

type AppendField = (typeof PROCEDURE_FORM_DEFINITIONS)["lap-appendicectomy"]["fields"][number];
type AnkleField = (typeof PROCEDURE_FORM_DEFINITIONS)["ankle-orif"]["fields"][number];

const append = (field: AppendField) => field;
const ankle = (field: AnkleField) => field;

append({ kind: "text", field: "appendixAppearance", label: "Synthetic" });
append({ kind: "checkbox", field: "convertedToOpen", label: "Synthetic", clearRule: { unless: true, fields: ["conversionReason"] } });
append({ kind: "text", field: "conversionReason", label: "Synthetic", showWhen: { field: "convertedToOpen", equals: true } });
ankle({ kind: "radio", field: "implantsUsed", label: "Synthetic", options: ["yes", "no"], clearRule: { unless: "yes", fields: ["implants"] } });

// @ts-expect-error A misspelled field is not an answer on this procedure.
append({ kind: "text", field: "appendixAppearence", label: "Synthetic" });
// @ts-expect-error A real field on another procedure is still invalid here.
append({ kind: "text", field: "ankleFracturePattern", label: "Synthetic" });
// @ts-expect-error A procedure discriminator is not an editable scalar control.
append({ kind: "text", field: "procedureId", label: "Synthetic" });
// @ts-expect-error Team arrays cannot be rendered as scalar controls.
append({ kind: "textarea", field: "additionalTeamMembers", label: "Synthetic" });
// @ts-expect-error Implant arrays cannot be rendered as scalar controls.
ankle({ kind: "text", field: "implants", label: "Synthetic" });
// @ts-expect-error String answers are not checkbox controls.
append({ kind: "checkbox", field: "appendixAppearance", label: "Synthetic" });
// @ts-expect-error Boolean answers are not text controls.
append({ kind: "text", field: "convertedToOpen", label: "Synthetic" });
// @ts-expect-error Boolean answers are not select controls.
append({ kind: "select", field: "convertedToOpen", label: "Synthetic", options: ["yes"] });
// @ts-expect-error Boolean answers are not custom-string controls.
append({ kind: "select-custom", field: "convertedToOpen", label: "Synthetic", options: [], customLabel: "Custom" });
// @ts-expect-error Visibility dependencies must belong to this procedure.
append({ kind: "text", field: "conversionReason", label: "Synthetic", showWhen: { field: "implantsUsed", equals: "yes" } });
// @ts-expect-error Visibility cannot compare a repeatable array to a scalar.
ankle({ kind: "text", field: "ankleFracturePattern", label: "Synthetic", showWhen: { field: "implants", equals: "yes" } });
// @ts-expect-error Boolean dependency comparisons require a boolean.
append({ kind: "text", field: "conversionReason", label: "Synthetic", showWhen: { field: "convertedToOpen", equals: "yes" } });
// @ts-expect-error String dependency comparisons require a string.
append({ kind: "text", field: "conversionReason", label: "Synthetic", showWhen: { field: "contaminationPresent", equals: true } });
// @ts-expect-error Clear targets must exist on this procedure.
append({ kind: "checkbox", field: "convertedToOpen", label: "Synthetic", clearRule: { unless: true, fields: ["conversionReazon"] } });
// @ts-expect-error Arrays on another procedure cannot be reset here.
append({ kind: "checkbox", field: "convertedToOpen", label: "Synthetic", clearRule: { unless: true, fields: ["implants"] } });
// @ts-expect-error Boolean answers cannot be reset to an empty string/array.
append({ kind: "checkbox", field: "convertedToOpen", label: "Synthetic", clearRule: { unless: true, fields: ["convertedToOpen"] } });
// @ts-expect-error Procedure identity must never be a clear target.
append({ kind: "checkbox", field: "convertedToOpen", label: "Synthetic", clearRule: { unless: true, fields: ["procedureId"] } });
// @ts-expect-error Checkbox clear conditions use booleans.
append({ kind: "checkbox", field: "convertedToOpen", label: "Synthetic", clearRule: { unless: "yes", fields: ["conversionReason"] } });
// @ts-expect-error Select clear conditions use strings.
ankle({ kind: "radio", field: "implantsUsed", label: "Synthetic", options: ["yes", "no"], clearRule: { unless: true, fields: ["implants"] } });
