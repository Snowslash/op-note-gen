function buildAppendicectomyOperationText(values) {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Appendix appearance: ${formatTextOperationValue(values.appendixAppearance)}`,
    `Perforation: ${formatYesNoOperationValue(values.perforation)}`,
    `Contamination: ${formatNoneOrPresentOperationValue(values.contaminationPresent, values.contaminationDescription)}`,
    `Mesoappendix division: ${formatSelectOperationValue(values.mesoappendixDivision)}`,
    `Stump control: ${formatSelectOperationValue(values.stumpControl)}`,
    `Specimen removed in bag: ${formatYesNoOperationValue(values.specimenRemovedInBag)}`,
    `Washout performed: ${formatYesNoOperationValue(values.washoutPerformed)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Converted to open: ${formatConversionOperationValue(values)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildCholecystectomyOperationText(values) {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Gallbladder appearance: ${formatTextOperationValue(values.gallbladderAppearance)}`,
    `Critical view of safety: ${formatAchievedOperationValue(values.criticalViewAchieved)}`,
    `Cystic duct control: ${formatSelectOperationValue(values.cysticDuctControl)}`,
    `Cystic artery control: ${formatSelectOperationValue(values.cysticArteryControl)}`,
    `Gallbladder removed in bag: ${formatYesNoOperationValue(values.gallbladderRemovedInBag)}`,
    `Bile spillage: ${formatNoneOrPresentOperationValue(values.bileSpillage, values.bileSpillageDetails)}`,
    `Stone spillage: ${formatNoneOrPresentOperationValue(values.stoneSpillage, values.stoneSpillageDetails)}`,
    `Intraoperative cholangiogram: ${formatPerformedOperationValue(values.cholangiogramPerformed, values.cholangiogramFindings)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Converted to open: ${formatConversionOperationValue(values)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildDiagnosticLaparoscopyOperationText(values) {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Abdominal survey: ${formatTextOperationValue(values.abdominalSurvey)}`,
    `Procedure performed: ${formatTextOperationValue(values.procedurePerformed)}`,
    `Washout/irrigation: ${formatTextOperationValue(values.washoutFluid)}`,
    `Adhesiolysis: ${formatTextOperationValue(values.adhesiolysisDetails)}`,
    `Source control: ${formatTextOperationValue(values.sourceControl)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Converted to open: ${formatConversionOperationValue(values)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function formatSentStatus(value) {
  if (value === "yes") {
    return "sent";
  }

  if (value === "no") {
    return "not sent";
  }

  return "not specified";
}

function formatYesNoNotApplicableOperationValue(value) {
  if (value === "not applicable") {
    return "not applicable";
  }

  return formatYesNoOperationValue(value);
}

function buildIncisionAndDrainageOperationText(values) {
  return [
    `Incision site: ${formatTextOperationValue(values.incisionSite)}`,
    `Incision: ${formatSelectOperationValue(values.incisionType)}`,
    `Contents drained: ${formatSelectOperationValue(values.abscessContents)}`,
    `Microbiology swab: ${formatSentStatus(values.pusSwabSent)}`,
    `Loculations broken down: ${formatYesNoNotApplicableOperationValue(values.loculationsBrokenDown)}`,
    `Cavity irrigation/washout: ${formatYesNoOperationValue(values.cavityIrrigated)}`,
    `Packing/drain: ${formatTextOperationValue(values.packingOrDrain)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildOpenInguinalHerniaRepairOperationText(values) {
  return [
    `Side: ${formatInlineValue(values.herniaSide)}`,
    `Hernia type: ${formatSelectOperationValue(values.herniaType)}`,
    `Hernia contents: ${formatTextOperationValue(values.herniaContents)}`,
    `Sac management: ${formatTextOperationValue(values.sacManagement)}`,
    `Mesh used: ${formatYesNoOperationValue(values.meshUsed)}`,
    `Mesh type: ${formatTextOperationValue(values.meshType)}`,
    `Mesh fixation: ${formatTextOperationValue(values.meshFixation)}`,
    `Cord structures: ${formatTextOperationValue(values.cordStructuresManaged)}`,
    `Ilioinguinal nerve: ${formatSelectOperationValue(values.ilioinguinalNerveStatus)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildOpenUmbilicalHerniaRepairOperationText(values) {
  return [
    `Defect size: ${formatTextOperationValue(values.umbilicalHerniaDefectSize)}`,
    `Hernia contents: ${formatTextOperationValue(values.umbilicalHerniaContents)}`,
    `Sac management: ${formatTextOperationValue(values.umbilicalSacManagement)}`,
    `Repair method: ${formatSelectOperationValue(values.umbilicalRepairMethod)}`,
    `Mesh used: ${formatYesNoOperationValue(values.umbilicalMeshUsed)}`,
    `Mesh type: ${formatTextOperationValue(values.umbilicalMeshType)}`,
    `Mesh position: ${formatSelectOperationValue(values.umbilicalMeshPosition)}`,
    `Mesh fixation: ${formatTextOperationValue(values.umbilicalMeshFixation)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildEmergencyLaparotomyOperationText(values) {
  const detailLine = (label, status, field) => {
    if (status === "yes" || field.trimmed) {
      return `${label}: ${formatTextOperationValue(field)}`;
    }

    return "";
  };

  return [
    `Incision: ${formatTextOperationValue(values.laparotomyIncision)}`,
    `Pathology/source: ${formatTextOperationValue(values.laparotomyPathology)}`,
    `Procedure performed: ${formatTextOperationValue(values.laparotomyProcedurePerformed)}`,
    `Bowel resection performed: ${formatYesNoOperationValue(values.laparotomyBowelResectionPerformed)}`,
    detailLine("Bowel resection details", values.laparotomyBowelResectionPerformed, values.laparotomyBowelResectionDetails),
    `Anastomosis performed: ${formatYesNoOperationValue(values.laparotomyAnastomosisPerformed)}`,
    detailLine("Anastomosis details", values.laparotomyAnastomosisPerformed, values.laparotomyAnastomosisDetails),
    `Stoma formed: ${formatYesNoOperationValue(values.laparotomyStomaFormed)}`,
    detailLine("Stoma details", values.laparotomyStomaFormed, values.laparotomyStomaDetails),
    `Washout performed: ${formatYesNoOperationValue(values.laparotomyWashoutPerformed)}`,
    detailLine("Washout details", values.laparotomyWashoutPerformed, values.laparotomyWashoutDetails),
    `Temporary abdominal closure: ${formatYesNoOperationValue(values.laparotomyTemporaryClosure)}`,
    detailLine("Temporary closure details", values.laparotomyTemporaryClosure, values.laparotomyTemporaryClosureDetails),
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildDrainText(values) {
  if (values.drainStatus === "no") {
    return "No drain placed";
  }

  if (values.drainStatus === "yes") {
    return values.drainLocation.present ? values.drainLocation.value : "not specified";
  }

  return "not specified";
}

function buildComplicationsText(values) {
  const normalisedComplications = values.complications.trimmed
    .toLowerCase()
    .replace(/[.!]+$/, "");

  if (!values.complications.trimmed) {
    return "not specified";
  }

  if (normalisedComplications === "nil" || normalisedComplications === "none") {
    return "No immediate complications.";
  }

  return values.complications.raw;
}

function buildClosureText(values) {
  const sentences = [];

  if (values.fascialClosurePerformed === "yes") {
    if (values.fascialSutureMaterial.trimmed) {
      sentences.push(sentenceWithValue("Fascial closure was performed with ", values.fascialSutureMaterial.raw));
    } else {
      sentences.push("Fascial closure was performed.");
    }
  } else if (values.fascialClosurePerformed === "no") {
    sentences.push("Fascial closure was not performed.");
  }

  if (values.skinClosureMethod.trimmed) {
    sentences.push(sentenceWithValue("Skin was closed with ", values.skinClosureMethod.raw));
  }

  return sentences.length ? sentences.join(" ") : "not specified";
}

function buildDateTimeLine(values) {
  return `Date/time: ${formatDateTimeValue(values.operationDateTime)}`;
}

function buildPrimaryTeamLine(values) {
  const surgeonValue = values.surgeon.trimmed ? values.surgeon.raw : "not specified";
  const assistantValue = values.assistant.trimmed ? values.assistant.raw : "not specified";
  return `Surgeon / Assistant: Surgeon ${surgeonValue}; Assistant ${assistantValue}`;
}

function buildAdditionalTeamMembersText(values) {
  if (!values.additionalTeamMembers.length) {
    return "";
  }

  return values.additionalTeamMembers
    .map((member) => `${member.role} ${member.name}`)
    .join("; ");
}

function buildAdditionalTeamMembersLine(values) {
  const additionalTeamMembersText = buildAdditionalTeamMembersText(values);
  return additionalTeamMembersText ? `Additional team members: ${additionalTeamMembersText}` : "";
}

function buildSupervisingConsultantLine(values) {
  return values.supervisingConsultant.trimmed
    ? `Supervising consultant: ${values.supervisingConsultant.raw}`
    : "";
}

function buildAnaestheticLine(values) {
  return `Anaesthetic: ${formatInlineValue(values.anaesthetic)}`;
}

function buildAnaesthetistLine(values) {
  return values.anaesthetist.trimmed ? `Anaesthetist: ${values.anaesthetist.raw}` : "";
}

function buildPortsSection(values) {
  return values.portsUsed.trimmed ? formatBlock("Ports", values.portsUsed) : "";
}

function buildOperationLine(values, procedure) {
  return `Operation:\n${procedure.buildOperationText(values)}`;
}

function buildSpecimenLine(values) {
  return `Specimen: ${formatInlineValue(values.specimen.trimmed ? values.specimen.raw : "")}`;
}

function buildDrainLine(values) {
  return `Drain: ${buildDrainText(values)}`;
}

function buildEstimatedBloodLossLine(values) {
  const bloodLossNormalised = values.bloodLoss.trimmed.toLowerCase();

  if (!values.bloodLoss.trimmed || bloodLossNormalised === "not specified") {
    return "";
  }

  return `Estimated blood loss: ${values.bloodLoss.raw}`;
}

function buildComplicationsLine(values) {
  return `Complications: ${buildComplicationsText(values)}`;
}

function buildClosureLine(values) {
  return `Closure: ${buildClosureText(values)}`;
}

function buildPostOperativePlanLine(values) {
  return [
    "Post-operative plan:",
    `Antibiotic prophylaxis: ${formatTextOperationValue(values.antibioticProphylaxis)}`,
    `DVT prophylaxis: ${formatTextOperationValue(values.dvtProphylaxis)}`,
    `Post-operative care instructions: ${formatTextOperationValue(values.postOpPlan)}`,
  ].join("\n");
}

function buildStandardOutputSections() {
  return [
    {
      build: (values, procedure) => `Procedure: ${procedure.title}`,
    },
    {
      build: buildDateTimeLine,
    },
    {
      build: buildPrimaryTeamLine,
    },
    {
      build: buildAdditionalTeamMembersLine,
    },
    {
      build: buildSupervisingConsultantLine,
    },
    {
      build: buildAnaestheticLine,
    },
    {
      build: buildAnaesthetistLine,
    },
    {
      build: (values) => formatBlock("Indication", values.indication),
    },
    {
      build: (values) => formatBlock("Findings", values.findings),
    },
    {
      build: buildPortsSection,
    },
    {
      build: buildOperationLine,
    },
    {
      build: buildSpecimenLine,
    },
    {
      build: buildDrainLine,
    },
    {
      build: buildEstimatedBloodLossLine,
    },
    {
      build: buildComplicationsLine,
    },
    {
      build: buildClosureLine,
    },
    {
      build: buildPostOperativePlanLine,
    },
  ];
}

function createTeamMemberRow(role = "Assistant", name = "") {
  const row = document.createElement("div");
  row.className = "team-member-row";
  row.dataset.teamMemberId = String(APP_STATE.teamMemberIdCounter);
  APP_STATE.teamMemberIdCounter += 1;

  row.innerHTML = `
    <label class="field">
      <span>Role</span>
      <select class="team-member-role" aria-label="Team member role">
        <option value="Surgeon"${role === "Surgeon" ? " selected" : ""}>Surgeon</option>
        <option value="Assistant"${role === "Assistant" ? " selected" : ""}>Assistant</option>
      </select>
    </label>
    <label class="field">
      <span>Name</span>
      <input type="text" class="team-member-name" aria-label="Team member name" autocomplete="off" value="${escapeHtml(name)}">
    </label>
    <button type="button" class="danger-button compact-button remove-team-member">Remove</button>
  `;

  return row;
}

function collectAdditionalTeamMembers() {
  return Array.from(DOM.teamMembersList.querySelectorAll(".team-member-row"))
    .map((row) => {
      const role = row.querySelector(".team-member-role").value;
      const nameField = row.querySelector(".team-member-name");
      const raw = nameField.value;

      return {
        role,
        name: raw,
        trimmedName: raw.trim(),
      };
    })
    .filter((member) => member.trimmedName);
}

function buildNoPortsOutputSections() {
  return buildStandardOutputSections()
    .filter((section) => section.build !== buildPortsSection);
}

// Procedure configs keep procedure-specific rules in one place so additional
// operations can reuse the same collection, visibility, validation, and output engine.
