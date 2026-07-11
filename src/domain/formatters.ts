import type { CommonProcedureInput } from "./types.ts";

export function hasText(value: string): boolean {
  return Boolean(value.trim());
}

export function sentenceWithValue(prefix: string, value: string): string {
  const suffix = /[.!?]$/.test(value.trim()) ? "" : ".";
  return `${prefix}${value}${suffix}`;
}

export function formatInlineValue(value: string, fallback = "not specified"): string {
  return value || fallback;
}

export function formatDateTimeValue(value: string): string {
  if (!hasText(value)) {
    return "not specified";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})$/);
  if (!match) {
    return value.replace("T", " ");
  }

  const [, year, month, day, time] = match;
  return `${day}/${month}/${year}, ${time}`;
}

export function formatBlock(label: string, value: string, fallback = "not specified"): string {
  return `${label}:\n${hasText(value) ? value : fallback}`;
}

export function formatTextOperationValue(value: string): string {
  return hasText(value) ? value : "not specified";
}

export function formatSelectOperationValue(value: string): string {
  return hasText(value) ? value : "not specified";
}

export function formatYesNoOperationValue(value: string): string {
  if (value === "yes" || value === "no") {
    return value;
  }

  return "not specified";
}

export function formatAchievedOperationValue(value: string): string {
  if (value === "yes") {
    return "achieved";
  }

  if (value === "no") {
    return "not achieved";
  }

  return "not specified";
}

export function formatNoneOrPresentOperationValue(value: string, details: string): string {
  if (value === "yes") {
    return hasText(details) ? details : "present";
  }

  if (value === "no") {
    return "none";
  }

  return "not specified";
}

export function formatPerformedOperationValue(value: string, details: string): string {
  if (value === "yes") {
    return hasText(details) ? `performed: ${details}` : "performed";
  }

  if (value === "no") {
    return "not performed";
  }

  return "not specified";
}

export function formatConversionOperationValue(convertedToOpen: boolean, conversionReason: string): string {
  if (!convertedToOpen) {
    return "no";
  }

  return hasText(conversionReason) ? conversionReason : "yes, reason not specified";
}

export function formatAdditionalDetailsOperationLine(values: CommonProcedureInput): string {
  return hasText(values.additionalOperativeDetails)
    ? `Additional operative details: ${values.additionalOperativeDetails}`
    : "";
}

export function buildDrainText(values: CommonProcedureInput): string {
  if (values.drainStatus === "no") {
    return "No drain placed";
  }

  if (values.drainStatus === "yes") {
    return hasText(values.drainLocation) ? values.drainLocation : "not specified";
  }

  return "not specified";
}

export function buildComplicationsText(values: CommonProcedureInput): string {
  const normalised = values.complications.trim().toLowerCase().replace(/[.!]+$/, "");

  if (!hasText(values.complications)) {
    return "not specified";
  }

  if (normalised === "nil" || normalised === "none") {
    return "No immediate complications.";
  }

  return values.complications;
}

export function buildClosureText(values: CommonProcedureInput): string {
  const sentences: string[] = [];

  if (values.fascialClosurePerformed === "yes") {
    sentences.push(hasText(values.fascialSutureMaterial)
      ? sentenceWithValue("Fascial closure was performed with ", values.fascialSutureMaterial)
      : "Fascial closure was performed.");
  } else if (values.fascialClosurePerformed === "no") {
    sentences.push("Fascial closure was not performed.");
  }

  if (hasText(values.skinClosureMethod)) {
    sentences.push(sentenceWithValue("Skin was closed with ", values.skinClosureMethod));
  }

  return sentences.length ? sentences.join(" ") : "not specified";
}

export function buildAdditionalTeamMembersLine(values: CommonProcedureInput): string {
  const members = values.additionalTeamMembers
    .filter((member) => hasText(member.name))
    .map((member) => `${member.role} ${member.name}`)
    .join("; ");

  return members ? `Additional team members: ${members}` : "";
}
