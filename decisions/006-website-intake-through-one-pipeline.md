# ADR-006: Website avatar intake feeds the same pipeline as phone intake

**Status:** Accepted (October 2026). Access controls in place (vendor CRM writes disabled, domain-restricted widget key, token-authenticated webhook); payload adapter in progress.

## Context

The public website now has a conversational avatar for visitor intake. Every "Request a Consultation" button opens it. The avatar vendor offers built-in CRM actions (create contact, add note) and a webhook that sends conversation data to an external endpoint after a conversation ends.

Phone intake already runs through a workflow that validates input, scores the lead with schema-checked LLM output, flags edge cases for human review, and writes to the CRM ([reference workflow](../workflows/client-intake-agent/)).

## Options considered

1. **Let the avatar write to the CRM directly** with the vendor's built-in actions. Fastest, but website leads would skip validation and scoring, write fields in a different shape, and duplicate any contact also created by the pipeline.
2. **Send the conversation to the intake pipeline** through the vendor's post-conversation webhook, with a small adapter that maps the vendor's payload to the pipeline's input schema.

## Decision

Option 2.

- The vendor's CRM write actions are disabled. Read-only lookup, used to recognize existing clients, may stay on.
- The webhook is authenticated with a header token and goes through the same allowlisted public path as every other webhook ([ADR-002](002-expose-only-webhook-paths.md)).
- The adapter is built against a **captured** test payload, not assumed field names, because the vendor does not publish its payload format.
- The avatar's widget key is restricted to the business's own domains.
- Any third-party API key the avatar uses gets the minimum permissions it needs and no write access.

## Consequences

- One intake standard across channels: the same validation, scoring, human-review rules, and CRM fields.
- Website leads arrive after the conversation ends, not mid-chat. That is acceptable for intake.
- The adapter is a dependency on an undocumented vendor format. If the vendor changes it, the adapter's validation rejects the payload and logs it rather than writing bad data.
- The public chat is an abuse surface (spam leads, cost). Mitigations: domain-restricted widget key, token-authenticated webhook, and the pipeline's existing input validation.
