# Real Cowork capture protocol

No screenshot in this cookbook may be an invented app interface. Local preview slots show the source workflow stage and a pending label.

## Access

Enable/check Computer Use with `/computer` in a supporting Copilot CLI session. The command appearing in help does not mean desktop controls are available to the agent. Confirm exposed tools and the intended desktop app before operating it. If unavailable, the user performs the same sequence and supplies screenshots.

Have the user handle authentication and sensitive consent. Agree the authorized account, sources, and placeholder values before any run. No sample dataset is supplied. Do not inspect unrelated tenant data, clipboard contents, or windows.

## Evidence for the deck workflow

Capture the real app identity, authorized source scope, original prompt with user-approved placeholder substitutions, visible progress through the source workflow, and final output. Capture the review/approval states that actually occur. These are evidence requirements, not new task instructions to append to the deck prompt.

The source workflow stages vary by scenario (four to six stages). Map screenshots to those stages and record unsupported capabilities; never replace a stage with a fabricated success.

Record native approval dialogs only if they actually appear. Distinguish file access, connector consent, business review, and outbound-action approval. If no native approval is shown, explicitly document the conversational review boundary. Do not fabricate one for consistency.

The app's visible plan and explanations are not a display of private internal reasoning.

## Safety and cleanup

The original prompts include conditional sharing, scheduling, publishing, and writebacks. Preserve their review boundaries and obtain explicit user approval before any consequential action. Merely displaying the source prompt on the website does not authorize its execution. Reject unexpected requests and stop if the scope expands.

Keep original screenshots privately. Crop/redact names, email addresses, tenant/account information, notifications, IDs, credentials, and unrelated content. Review redaction at original resolution.

## Adding evidence

Place a sanitized PNG/JPG/WebP in `public/screenshots/<recipe-id>/` and populate that step's `evidence` array:

```typescript
{
  file: '02-visible-plan.png',
  caption: text('English caption', '繁體中文說明', '简体中文说明'),
  alt: text('Description of actual state', '實際狀態描述', '实际状态描述'),
  capturedAt: 'YYYY-MM-DD',
  platform: 'Observed application name and version',
  redacted: true,
  reviewed: true,
}
```

Use the actual capture date/version. A step can have multiple screenshots to show a real prompt and its post-decision result. The date string in the example is a format placeholder, not valid release evidence.

Save sanitized actual output artifacts only after review. Validate them against authorized sources and the deck's requested deliverables. Record any discrepancies without silently rewriting the original prompt. Mark `verified` true only after an actual verified run; a successful page build is not a successful Cowork run.

Package reviewed actual outputs in a ZIP under `public/reference-outputs/<recipe-id>/` and add `outputEvidence: [{ file: 'cowork-output.zip', description: text(...), reviewed: true }]` to the recipe. A ZIP prevents generated HTML from executing within the cookbook origin. The release check requires this real-run output evidence as well as screenshots.
