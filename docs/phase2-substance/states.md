# Phase 2 State Taxonomy

## Smart Input States

- `idle-empty`: no input yet; user can paste text or choose a file.
- `editing`: user is changing input; previous draft remains visible until replaced.
- `normalizing`: text is being normalized.
- `classifying`: structure detection is running.
- `inferred-high`: useful draft exists with confidence >= 0.75.
- `inferred-review`: draft exists with confidence >= 0.45 and < 0.75.
- `inferred-low`: draft exists but requires review before applying.
- `unsupported-recoverable`: input is recognized but not supported enough to apply; user receives why and next step.
- `error-recoverable`: input could not be parsed; user's text remains intact.
- `cancelled`: latest parse was cancelled; prior draft remains intact.
- `applying`: draft is being applied to local state.
- `applied`: local state updated; activity log records the operation.

Every state exits through at least one of: edit input, clear input, retry, cancel, apply, or copy debug JSON.

## Existing Workflow States

- `profile-empty`: default profile only.
- `profile-user-location`: user selected or inferred a location.
- `plan-empty`: no selected crops.
- `plan-some`: selected crop set produces tasks.
- `soil-empty`: no soil tests.
- `soil-some`: at least one soil test exists.
- `harvest-empty`: no harvests.
- `harvest-some`: harvest summaries are available.
- `classifier-idle`: no image.
- `classifier-running`: image inference active.
- `classifier-result`: image inference result exists.
- `classifier-unsupported`: image cannot be processed or confidence is low.

No state should leave the user without a visible next action.
