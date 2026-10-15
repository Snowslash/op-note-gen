import type { ProjectPageData } from "./ProjectPage";

// Everything on the project page that is specific to this project. The layout lives in ProjectPage.
export const project: ProjectPageData = {
  key: "opnotes",
  name: "Operation Note Generator",
  tagline: "Plain-text operation note drafts",
  description: "Pick a procedure, fill in a few fields, and get a plain-text operation note to check and copy. Covers general surgery and trauma and orthopaedics.",
  why: "I made it because I was tired of typing out the same structure after common operations.",
  actions: [{ label: "Open the generator", href: "./app/" }],
  sourceHref: "https://github.com/Snowslash/op-note-gen",
  beforeYouUse: [
    "Don’t type anything that could identify a patient.",
    "It all runs in your browser. Nothing you type is sent anywhere, saved, or added to the page address.",
    "Read every draft carefully before it goes into a clinical record.",
  ],
  shotsNote: "The generator as it opens, with no patient details entered.",
  shots: [
    {
      src: "./assets/opnotes-generator.webp",
      alt: "Operation Note Generator as it opens: a list of procedures to choose from, a privacy notice, and the five steps to a draft, with nothing filled in.",
      width: 1524,
      height: 1024,
      caption: "Choosing a procedure. The privacy notice and the five drafting steps are shown, with no patient details entered.",
    },
  ],
  capabilities: [
    ["Draft twelve procedures", "Seven general surgery operations and five trauma and orthopaedics ones."],
    ["Fill in only what matters", "The form changes to match the operation, so you’re not working through one long generic form."],
    ["Get three kinds of text", "A full operation note, a post-op plan or a short ward handover. The text is built from your answers, not rewritten by AI."],
    ["Check before you copy", "Copy only unlocks once you’ve made a fresh draft and confirmed you’ve read it."],
  ],
  limits: "It helps you write the note. It doesn’t make decisions. It won’t choose an operation, guess findings or check consent, and it doesn’t replace local policy, a senior’s review or your responsibility for the final record.",
};
