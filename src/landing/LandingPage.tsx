import { ArrowLeft, ArrowUpRight, Code } from "lucide-react";
import {
  EstateBoundary,
  EstateEvidenceFrame,
  EstatePageTitle,
  EstateSectionTitle,
  EstateShell,
  PublicEstateHeader,
  useEstateTheme,
} from "@sangeev/estate-ui";

const capabilities = [
  ["Seven common procedures", "Appendicectomy, cholecystectomy, diagnostic laparoscopy, abscess drainage, two open hernia repairs and emergency laparotomy."],
  ["Procedure-specific forms", "The operative fields change with the selected procedure instead of forcing every case through one generic template."],
  ["Three plain-text outputs", "Generate a full operation note, postoperative plan or ward handover summary without AI rewriting."],
  ["Review before copy", "A fresh draft must be generated and explicitly reviewed before the copy action becomes available."],
];

export default function LandingPage() {
  const { theme, toggleTheme } = useEstateTheme();

  return (
    <>
      <PublicEstateHeader current="opnotes" theme={theme} onToggleTheme={toggleTheme} />
      <EstateShell variant="landing">
        <main>
          <section className="hero" aria-labelledby="page-title">
            <div className="hero-copy">
              <a className="back-link" href="https://sangeev.me/#projects"><ArrowLeft size={15} aria-hidden="true" /> Public tools</a>
              <EstatePageTitle id="page-title" variant="landing">Operation Note Generator</EstatePageTitle>
              <p className="project-summary">A browser tool for drafting common general-surgery operation notes.</p>
              <p className="lede">
                I made this because I was tired of retyping the same structure after common cases. Select a procedure, complete the relevant fields and generate a plain-text draft to check before copying.
              </p>
              <div className="hero-actions">
                <a className="estate-primary-action" href="./app/">Open generator <ArrowUpRight size={17} aria-hidden="true" /></a>
                <a className="estate-primary-action" href="https://github.com/Snowslash/op-note-gen"><Code size={17} aria-hidden="true" /> Source on GitHub</a>
              </div>
            </div>

            <EstateBoundary className="hero-boundary" label="Privacy and clinical safety boundary">
              <p><strong>Do not enter patient-identifiable information.</strong></p>
              <p>The generator runs entirely in your browser. No entered clinical text is transmitted, stored or written to the URL.</p>
              <p>Review generated text carefully before use in any clinical record.</p>
            </EstateBoundary>
          </section>

          <section className="evidence" aria-labelledby="evidence-title">
            <div className="section-heading compact">
              <EstateSectionTitle id="evidence-title">Structured fields in. Plain text out.</EstateSectionTitle>
            </div>
            <figure className="screenshot">
              <EstateEvidenceFrame as="div" className="image-frame">
                <img src="./assets/opnotes-generator.webp" alt="Operation Note Generator showing the procedure picker, browser-only safety boundary and five-stage drafting workflow with no patient data entered." width="1524" height="1024" />
              </EstateEvidenceFrame>
            </figure>
          </section>

          <section className="capabilities" aria-labelledby="capabilities-title">
            <div className="section-heading compact">
              <EstateSectionTitle id="capabilities-title">Narrow, explicit and inspectable.</EstateSectionTitle>
            </div>
            <div className="capability-grid">
              {capabilities.map(([title, description]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="status-band" aria-labelledby="status-title">
            <div>
              <EstateSectionTitle id="status-title">A drafting aid, not decision support.</EstateSectionTitle>
              <p>It does not choose an operation, infer findings, check consent or replace local policy, senior review or the clinician's responsibility for the final record.</p>
            </div>
            <a href="https://github.com/Snowslash/op-note-gen">Read the project notes <ArrowUpRight size={17} aria-hidden="true" /></a>
          </section>
        </main>

        <footer>
          <p>Operation Note Generator · Maintained by Sangeev</p>
          <a href="https://sangeev.me">Back to sangeev.me</a>
        </footer>
      </EstateShell>
    </>
  );
}
