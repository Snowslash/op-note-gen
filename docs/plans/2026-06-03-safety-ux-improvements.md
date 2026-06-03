# Safety and workflow improvements

Verified implementation scope for items 1, 3, 4, 6, 9 and 10.

## Changes

- Stale generated output is invalidated after form edits, procedure changes and dynamic team-member changes.
- Copy is disabled until a fresh draft exists and the user confirms they have reviewed it.
- Clear Note resets generated output, copy/review state, stale notices, validation and warning UI while preserving form inputs.
- Clear Form resets form inputs, dynamic team rows, output state, validation and warnings, then re-autofills the operation date/time.
- Output mode supports full operative note, post-operative plan only and ward handover summary.
- Alternate output modes reuse explicit user-entered content and omit unspecified post-op/handover placeholders where possible.
- Section jump navigation and validation accessibility affordances were added.

## Safety constraints

- Static browser-only app.
- No backend storage or upload.
- No patient-identifiable fields added.
- No AI rewriting.
- No automatic clinical recommendations.
- No safety-critical defaults to completed, normal or nil.
