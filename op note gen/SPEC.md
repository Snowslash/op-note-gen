# Operative Note Generator — MVP Spec

## 1. Problem
Operative notes are repetitive, time-consuming, and variable in quality.  
This tool standardises and accelerates note-writing while maintaining accuracy.

---

## 2. Target User
- Core surgical trainees (UK NHS)
- SHOs / registrars

---

## 3. Scope (MVP)
Only implement:
- Laparoscopic appendicectomy

No other procedures in version 1.

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
- If data is missing → omit or state "not specified"
- Neutral, factual tone only
- User must review before use

---

## 6. Input Fields

### Global fields
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
- Post-operative plan (text)

### Procedure-specific (lap appendicectomy)
- Perforated? (yes/no)
- Base healthy? (yes/no)
- Mesoappendix division method (text)
- Stump control (text)
- Washout performed? (yes/no)
- Retrieval bag used? (yes/no)

---

## 7. Output Format (Fixed)

The generated operative note must contain:

- Procedure  
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
- Post-operative plan  

---

## 8. Generation Logic

### General
- Use structured template
- Insert only provided data
- Do not assume or infer missing details

### Operation section (example logic)
- Always describe entry (generic acceptable)
- Include appendix identification
- Include mesoappendix division (if provided)
- Include stump control (if provided)
- Include retrieval bag usage if "yes"
- Include washout if "yes"
- Include perforation if "yes"

### Conditional examples
- If perforated = yes → include "features consistent with perforation"
- If drain = no → include "No drain placed"
- If complications empty → "No immediate complications"

---

## 9. UI Requirements

- Single-page layout
- Structured form inputs
- Procedure title displayed (lap appendicectomy)
- "Generate Note" button
- Output displayed below form
- "Copy to Clipboard" button

---

## 10. Safety Checks

Before generating:
- Indication must be filled
- Findings must be filled

Warnings (non-blocking):
- No complications entered → confirm none
- No specimen entered → confirm none
- No drain entered → confirm none

---

## 11. Output Behaviour

- Clean, professional formatting
- Paragraph structure
- No bullet points in final note
- No placeholders visible

---

## 12. File Structure

/index.html  
/styles.css  
/script.js  

---

## 13. Success Criteria

- User can generate a full note in <60 seconds
- No missing sections in output
- No fabricated information
- Output is copy-paste ready

---

## 14. Out of Scope

- Other procedures
- Voice input
- EMR integration
- AI-generated clinical decisions
- Patient-identifiable data

---

## 15. Future Versions (Not MVP)

- Additional procedures
- Free-text shorthand parsing
- Export to PDF/Word
- Custom templates

---