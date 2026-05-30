# Op notes visual language

Reading this site as a small personal clinical utility, not a medical SaaS product.

## Posture

- Plain project note by Sangeev.
- Useful, quiet and slightly boring is better than polished launch-page theatre.
- The page should feel maintained by a clinician who made a tool for a repetitive job.
- Do not imply approval, validation, hospital endorsement, AI automation or product maturity.

## Structure

Use this rhythm for public clinical-tool pages:

1. small estate navigation back to Sangeev and sibling tools;
2. literal page title;
3. one restrained first-person origin line;
4. one sentence explaining the browser-only mechanics;
5. primary action;
6. safety/privacy notice near the action;
7. concrete evidence: screenshot plus generated text excerpt;
8. limits and status.

Cut generic sections such as "Why it matters", roadmaps, feature-card rows, status badges, social proof, same-page jump links and CTA repeats.

## Type

- Public/project page: Charter-style serif headings.
- Body/UI: system sans.
- Generated note examples: monospace.
- Avoid huge editorial hero type. Current h1 max is about 46px.

## Colour and surface

- Light: warm paper/off-white, dark ink, one restrained blue accent.
- Dark default: warm near-black/brown, cream ink, pale blue accent.
- No gradients, glow, glass, dark grids, fake app chrome or bento cards.
- Use lines and simple bordered notices rather than shadows.

## Copy

Good opener:

> I made this because I was tired of retyping the same structure after common emergency general-surgery cases.

Good mechanical line:

> It is just a browser form that turns fields into a draft operation note. No login, backend, analytics or autosave.

Safety wording stays active and near the action:

> Do not enter patient-identifiable information.
> Review the generated text carefully before using it in any clinical record.

## Verification

Before shipping visual changes:

- check desktop and mobile in the browser;
- run `npm run verify`;
- run `impeccable detect docs/index.html` as lint, not taste approval;
- apply the contextual page-role test: if it reads like medtech/SaaS, simplify.
