# 0049 - Inspectability And Debug Surface

## Status

Accepted

## Context

Inference systems need inspectability for power users and support.

## Decision

Add a `?debug=1` overlay that shows the latest draft JSON, source hash, confidence, anomalies, and timing marks.

## Consequences

- Users can inspect why a draft happened.
- Debug data is local only and not sent anywhere.

## Alternatives Considered

- Hidden console logs: rejected because they are not discoverable and violate the no-noisy-console policy.
