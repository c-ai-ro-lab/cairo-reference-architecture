# NIST AI RMF Mapping: Client Intake Agent

How the [Client Intake Agent](../workflows/client-intake-agent/) addresses the four functions of the [NIST AI Risk Management Framework (AI RMF 1.0)](https://www.nist.gov/itl/ai-risk-management-framework). This is the format used for every production workflow.

## System profile

| Item | Value |
|---|---|
| Purpose | Summarize and score inbound inquiries so a person can prioritize follow-up |
| Decision made by AI | None binding. The AI produces a recommendation; a person decides whether and how to engage. |
| Data processed | Name, email, company, phone, free-text message submitted voluntarily by the prospect |
| Affected parties | Prospects (could be deprioritized unfairly); the business (could miss a good lead) |
| Model | Hosted LLM via API, temperature 0 |
| Risk tier (internal) | Low–moderate: personal contact data, no automated adverse decision |

## GOVERN — policies, roles, accountability

| Practice | How it is met |
|---|---|
| Accountability is assigned | The director owns the workflow, approves changes, and reviews flagged leads |
| AI use is documented | This file, the workflow README, and the decision records |
| Human oversight is defined | [ADR-004](../decisions/004-human-approval-gates-for-agents.md): the agent cannot contact a prospect or send anything externally |
| Change control | Workflows are designed, prototyped in a sandbox, validated, then promoted. Production exports are version-controlled. |

## MAP — context and risks

| Risk identified | Context |
|---|---|
| Prompt injection via the message field | Free text from the public internet is passed to an LLM |
| Malformed or fabricated LLM output | LLMs can return prose, extra keys, or out-of-range values |
| Unfair deprioritization | A low score could cause a legitimate inquiry to be ignored |
| PII exposure | Contact details could leak through logs or an exposed admin interface |
| Availability | LLM or CRM outage could drop leads |

## MEASURE — how each risk is tested

| Risk | Measurement |
|---|---|
| Malformed LLM output | [Automated tests](../workflows/client-intake-agent/tests/code-nodes.test.js) feed prose, off-schema tiers, out-of-range scores, and empty responses; each must route to human review |
| Malformed input | Tests confirm empty and invalid payloads are rejected without crashing |
| Infrastructure exposure | Ports verified closed from outside after every change ([ADR-003](../decisions/003-docker-bypasses-ufw.md)) |
| Scoring drift | Periodic manual review of a sample of scored leads against the director's own judgment |

## MANAGE — controls in place

| Risk | Control |
|---|---|
| Prompt injection | System/user role separation; inquiry wrapped in tags declared as data; tag characters stripped from input; output schema enforced so injected instructions cannot change what gets written |
| Malformed output | Strict schema validation with a safe fallback that flags the lead for review |
| Unfair deprioritization | No lead is discarded. Low scores (< 40) and high-value leads are flagged for human review; every lead lands in the CRM. |
| PII exposure | Admin UI behind zero-trust; webhook path allowlist; successful execution data not retained; failure logs exclude PII |
| Availability | Retries with backoff; on CRM failure the sender still gets a 202 and the failure is logged for follow-up |

## Residual risk

Accepted by the system owner. The main residual risk is a plausible-but-wrong summary that passes schema validation. It is mitigated by the fact that a person reads the inquiry before any engagement decision. See the [FAIR analysis](fair-risk-example.md) for the quantified view of the highest-impact scenario.
