# NIST AI RMF Mapping: Client Intake Agent

How the [Client Intake Agent](../workflows/client-intake-agent/) addresses the four functions of the [NIST AI Risk Management Framework (AI RMF 1.0)](https://www.nist.gov/itl/ai-risk-management-framework). This is the format used for every production workflow.

## System profile

| Item | Value |
|---|---|
| Purpose | Summarize and score inbound inquiries so a person can prioritize follow-up |
| Decision made by AI | None binding. The AI produces a recommendation; a person decides whether and how to engage. |
| Data processed | Name, email, company, phone, free-text message submitted voluntarily by the prospect |
| Channels | Website chat through a conversational widget that calls the pipeline during the conversation ([ADR-008](../decisions/008-website-chat-with-in-conversation-tools.md)); phone channel planned |
| Assessment basis | Self-assessed by CAIRO. No control in this mapping has been independently evaluated. |
| Affected parties | Prospects (could be deprioritized unfairly); the business (could miss a good lead) |
| Model | Hosted LLM via API, temperature 0 |
| Risk tier (internal) | Low–moderate: personal contact data, no automated adverse decision |

## GOVERN: policies, roles, accountability

| Practice | How it is met |
|---|---|
| Accountability is assigned | The director owns the workflow, approves changes, and reviews flagged leads |
| AI use is documented | This file, the workflow README, and the decision records |
| Human oversight is defined | [ADR-004](../decisions/004-human-approval-gates-for-agents.md): the agent cannot contact a prospect or send anything externally |
| Change control | Workflows are designed, prototyped in a sandbox, validated, then promoted. Production exports are version-controlled. |

## MAP: context and risks

| Risk identified | Context |
|---|---|
| Prompt injection via the message field | Free text from the public internet is passed to an LLM |
| Malformed or fabricated LLM output | LLMs can return prose, extra keys, or out-of-range values |
| Unfair deprioritization | A low score could cause a legitimate inquiry to be ignored |
| PII exposure | Contact details could leak through logs or an exposed admin interface |
| Availability | LLM or CRM outage could drop leads |
| Third-party conversation platform | Website chat runs on an external conversational platform that can call intake and scheduling tools during the conversation |
| Abuse of the public chat | Spam leads, unwanted holds or invoices, or deliberate cost inflation through the public widget |

## MEASURE: how each risk is tested

| Risk | Measurement | Status |
|---|---|---|
| Malformed LLM output | [Automated tests](../workflows/client-intake-agent/tests/code-nodes.test.js) feed prose, off-schema tiers, out-of-range scores, and empty responses; each must route to human review | Internally verified: runs in CI on every push |
| Malformed input | Tests confirm empty and invalid payloads are rejected without crashing | Internally verified: runs in CI on every push |
| Infrastructure exposure | Policy: verify from outside after infrastructure changes ([ADR-003](../decisions/003-docker-bypasses-ufw.md)) | Director-reported check on Oct 12, 2026; method and results not yet recorded |
| Scoring drift | Planned: periodic manual review of a sample of scored leads against the director's judgment | Not yet scheduled or recorded |
| Tool use on the public channel | Planned: end-to-end test conversations covering valid, incomplete, and abusive inputs | Not yet run |

## MANAGE: controls

| Risk | Control | Status |
|---|---|---|
| Prompt injection | System/user role separation; inquiry wrapped in tags declared as data; tag characters stripped from input; output schema enforced so injected instructions cannot change what gets written | Implemented in the reference workflow. Schema enforcement is covered by tests; prompt-level defenses have not been tested against injection attempts |
| Malformed output | Strict schema validation with a safe fallback that flags the lead for review | Internally verified by tests |
| Unfair deprioritization | No lead is discarded. Low scores (< 40) and high-value leads are flagged for human review; every lead lands in the CRM | Flagging logic covered by tests; CRM write not tested end to end |
| PII exposure | Admin UI behind zero-trust; webhook path allowlist; successful execution data not retained; failure logs exclude PII | Infrastructure controls director-reported; log behavior not yet verified |
| Availability | Retries with backoff; on CRM failure the sender still gets a 202 and the failure is logged for follow-up | Configured in the reference workflow; failure behavior not yet tested |
| Third-party conversation platform | Leads enter through the same intake pipeline and validation as other channels | Pipeline validation as above; platform access-control review not yet recorded |
| Abuse of the public chat | Input validation rejects malformed leads; holds expire after 24 hours unless paid | Not yet verified |

## Residual risk

Accepted by the system owner. Statuses above are self-assessed; see [build status](../architecture/build-status.md) for evidence gaps. The main residual risk is a plausible-but-wrong summary that passes schema validation. It is mitigated by the fact that a person reads the inquiry before any engagement decision. See the [FAIR analysis](fair-risk-example.md) for the quantified view of the highest-impact scenario.
