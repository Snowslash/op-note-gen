# Operative Note Generator - MVP Spec

## 1. Problem
Operative notes are repetitive, time-consuming, and variable in quality.
This tool standardises and accelerates note-writing while maintaining accuracy.

---

## 2. Target User
- Core surgical trainees (UK NHS)
- SHOs / registrars

---

## 3. Scope (MVP)
Current supported procedures:
- Laparoscopic appendicectomy
- Laparoscopic cholecystectomy
- Diagnostic laparoscopy +/- washout / adhesiolysis
- Incision and drainage of abscess
- Open inguinal hernia repair
- Open umbilical hernia repair
- Emergency laparotomy

Do not add other procedures unless explicitly scoped.

---

## 4. Tech Constraints
- Pure HTML
- Pure CSS
- Vanilla JavaScript
- No frameworks
- No backend

---

## 5. Core Rules (Non-negotiable)
- Do NOT invent clinical details
- If data is missing -> omit or state "not specified"
- Neutral, factual tone only
- User must review before use

---

## 6. Input Fields

### Global fields
- Date/time (datetime-local, autofilled to current local date/time)
- Surgeon (text)
- Assistant (text)
- Anaesthetic (dropdown: GA / regional / local)
- Indication (text, required)
- Findings (text, required)
- Specimen (text or "none")
- Drain (yes/no + details)
- Estimated blood loss (text, optional)
- Complications (text or "none")
- Closure (text)
- Post-operative plan including antibiotic prophylaxis, DVT prophylaxis, and care instructions (text)

### Procedure-specific (lap appendicectomy)
- Appendix appearance / operative findings (text)
- Perforated? (yes/no)
- Mesoappendix division method (text)
- Stump control (text)
- Washout performed? (yes/no)
- Specimen removed in bag? (yes/no)

### Procedure-specific (lap cholecystectomy)
- Gallbladder appearance / operative findings (text)
- Critical view of safety achieved? (yes/no)
- Cystic duct control method (text)
- Cystic artery control method (text)
- Gallbladder removed in bag? (yes/no)
- Bile spillage? (yes/no + details)
- Stone spillage? (yes/no + details)
- Intraoperative cholangiogram? (yes/no + findings)

### Procedure-specific (diagnostic laparoscopy +/- washout / adhesiolysis)
- Abdominal survey / key findings (text)
- Procedure performed (text)
- Washout / irrigation details (text)
- Adhesiolysis details (text)
- Source control / intra-abdominal pathology dealt with (text)

### Procedure-specific (incision and drainage of abscess)
- Abscess / wound site (text)
- Incision type (select/custom)
- Contents drained (select/custom)
- Microbiology swab sent? (yes/no)
- Loculations broken down? (yes/no/not applicable)
- Cavity irrigated / washed out? (yes/no)
- Packing or drain details (text)

### Procedure-specific (open inguinal hernia repair)
- Side (right/left/bilateral)
- Hernia type (select/custom)
- Hernia contents (text)
- Sac management (text)
- Mesh used? (yes/no)
- Mesh type (text)
- Mesh fixation (text)
- Cord structures management (text)
- Ilioinguinal nerve status (select/custom)

### Procedure-specific (open umbilical hernia repair)
- Defect size (text)
- Hernia contents (text)
- Sac management (text)
- Repair method (select/custom)
- Mesh used? (yes/no)
- Mesh type (text)
- Mesh position (select/custom)
- Mesh fixation (text)

### Procedure-specific (emergency laparotomy)
- Incision (text)
- Pathology / source (text)
- Procedure performed (text)
- Bowel resection performed? (yes/no + details)
- Anastomosis performed? (yes/no + details)
- Stoma formed? (yes/no + details)
- Washout performed? (yes/no + details)
- Temporary abdominal closure? (yes/no + details)

---

## 7. Output Format (Fixed)

The generated operative note must contain:

- Procedure
- Date/time
- Surgeon / Assistant
- Anaesthetic
- Indication
- Findings
- Operation
- Specimen
- Drain
- Estimated blood loss
- Complications
- Closure
- Post-operative plan, including antibiotic prophylaxis, DVT prophylaxis, and care instructions

---

## 8. Generation Logic

### General
- Use structured template
- Insert only provided data
- Do not assume or infer missing details

### Operation section (lap appendicectomy example logic)
- Always describe entry (generic acceptable)
- Output structured labelled lines rather than a prose paragraph
- Include appendix appearance
- Include perforation, contamination, mesoappendix division, stump control, retrieval bag usage, washout, haemostasis, drain, and conversion status
- Use `not specified` for unanswered structured operation fields

### Operation section (lap cholecystectomy example logic)
- Always describe entry (generic acceptable)
- Output structured labelled lines rather than a prose paragraph
- Include gallbladder appearance, critical view, cystic duct control, cystic artery control, retrieval bag usage, bile spillage, stone spillage, cholangiogram, haemostasis, drain, and conversion status
- Use `not specified` for unanswered structured operation fields

### Operation section (diagnostic laparoscopy +/- washout / adhesiolysis logic)
- Output structured labelled lines rather than a prose paragraph
- Include laparoscopic entry, abdominal survey, procedure performed, washout/irrigation, adhesiolysis, source control, haemostasis, and conversion status
- Use `not specified` for unanswered structured operation fields
- Do not infer pathology/source control beyond the user's entered findings

### Operation section (incision and drainage of abscess logic)
- Output structured labelled lines rather than a prose paragraph
- Include abscess/wound site, incision type, contents drained, microbiology swab status, loculations, cavity irrigation/washout, packing or drain, and haemostasis
- Use `not specified` for unanswered structured operation fields
- Preserve `not applicable` where explicitly selected

### Operation section (open inguinal hernia repair logic)
- Output structured labelled lines rather than a prose paragraph
- Include side, hernia type, contents, sac management, mesh used, mesh type, mesh fixation, cord structures, ilioinguinal nerve status, and haemostasis
- Use `not specified` for unanswered structured operation fields
- Do not include laparoscopic ports for open inguinal hernia repair output

### Operation section (open umbilical hernia repair logic)
- Output structured labelled lines rather than a prose paragraph
- Include defect size, hernia contents, sac management, repair method, mesh used, mesh type, mesh position, mesh fixation, and haemostasis
- Use `not specified` for unanswered structured operation fields
- Do not include laparoscopic ports or inguinal-only cord/ilioinguinal nerve fields for open umbilical hernia repair output

### Operation section (emergency laparotomy logic)
- Output structured labelled lines rather than a prose paragraph
- Include incision, pathology/source, procedure performed, bowel resection status/details, anastomosis status/details, stoma status/details, washout status/details, temporary abdominal closure status/details, and haemostasis
- Use `not specified` for unanswered structured operation fields
- Include module detail lines when the module is marked yes or details have been entered
- Do not include laparoscopic ports or hernia-specific fields for emergency laparotomy output

### Conditional examples
- If perforated = yes -> include "features consistent with perforation"
- If drain = no -> include "No drain placed"
- If complications is empty -> "not specified"
- If complications is entered as "none" or "nil" -> "No immediate complications"

---

## 9. UI Requirements

- Single-page layout
- Structured form inputs
- Procedure selector displayed as compact operation buttons with a fallback dropdown
- Date/time field autofills to current local date/time but remains editable
- Dark mode toggle displayed and persisted locally
- Selected procedure title displayed
- "Generate Note" button
- Output displayed below form
- "Copy to Clipboard" button

---

## 10. Safety Checks

Before generating:
- Indication must be filled
- Findings must be filled

Warnings (non-blocking):
- No complications entered -> confirm none
- No specimen entered -> confirm none
- No drain entered -> confirm none

---

## 11. Output Behaviour

- Clean, professional formatting
- Paragraph structure with structured labelled operation lines
- No bullet points in final note
- No placeholders visible

---

## 12. File Structure

/docs/index.html
/docs/styles.css
/docs/js/core.js
/docs/js/procedures.js
/docs/js/app.js

---

## 13. Success Criteria

- User can generate a full note in <60 seconds
- No missing sections in output
- No fabricated information
- Output is copy-paste ready

---

## 14. Out of Scope

- Procedures other than laparoscopic appendicectomy, laparoscopic cholecystectomy, diagnostic laparoscopy +/- washout / adhesiolysis, incision and drainage, open inguinal hernia repair, open umbilical hernia repair, and emergency laparotomy
- Voice input
- EMR integration
- AI-generated clinical decisions
- Patient-identifiable data

---

## 15. Future Versions (Not MVP)

- Additional procedures beyond appendicectomy, cholecystectomy, diagnostic laparoscopy, incision and drainage, open inguinal hernia repair, open umbilical hernia repair, and emergency laparotomy
- Free-text shorthand parsing
- Export to PDF/Word
- Custom templates


## Safety workflow controls

The app must block copying stale generated text after form edits. Copying requires a fresh generated draft and an explicit review confirmation. Clear Note and Clear Form must reset output/copy/review state predictably. Alternate output modes must be rule-based and use only user-entered data.
