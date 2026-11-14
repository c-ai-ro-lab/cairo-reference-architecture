# Build Status

Where the CAIRO operating system stands. Component names are generic; see the [operating model](multi-agent-operating-model.md) for what each role does.

**Last updated:** November 11, 2026

## How to read this page

Each component has two separate statuses. A component can be running without its controls having been checked, so one never implies the other.

**Lifecycle status:** where the component is in its build.

| Label | Meaning |
|---|---|
| Designed | Architecture decided; build not started |
| In progress | Being built or tested; not complete in the stated scope |
| Live | Running in the stated environment |
| On hold | Partly built; paused for higher priorities |

**Assurance status:** what evidence exists that the component and its controls work as described. These follow the [AI Engineering Methodology](../docs/AI-ENGINEERING-METHODOLOGY.md#honest-progress-reporting).

| Label | Meaning |
|---|---|
| Not yet verified | No check has been recorded |
| Director-reported | The director reported the result; no test record is published here |
| Internally verified | A test and its observed result are recorded, with a link to the evidence |
| Independently evaluated | An identified outside reviewer assessed the stated scope |

No component on this page has been independently evaluated.

## Infrastructure

| Component | Lifecycle | Assurance | Basis and notes |
|---|---|---|---|
| Self-managed workflow engine and local LLM on a VPS | Live | Director-reported | |
| Zero-trust admin access, pointed at the internal container name rather than the public IP | Live | Director-reported (Oct 12, 2026) | [ADR-001](../decisions/001-zero-trust-admin-access.md) |
| Outbound tunnel with a webhook-only path allowlist | Live | Director-reported (Sep 21, 2026) | [ADR-002](../decisions/002-expose-only-webhook-paths.md) |
| Container ports bound to loopback and closed from outside | Live | Director-reported (Oct 12, 2026) | Test method and results not yet recorded; see [ADR-003](../decisions/003-docker-bypasses-ufw.md) |
| All edge containers under one Compose project | Designed | Not applicable | Target state shown in the [reference stack](../reference-stack/docker-compose.yml) |
| Secret scanning and workflow tests on every push to this repository | Live | Internally verified | Automated; results are in this repository's Actions history |

## Agents and workflows

| Component | Lifecycle | Assurance | Basis and notes |
|---|---|---|---|
| Website chat intake | Live | Director-reported | Since Oct 21, 2026 the public site uses a conversational voice-and-text widget that calls the intake pipeline during the conversation ([ADR-008](../decisions/008-website-chat-with-in-conversation-tools.md)). Since Nov 11, 2026 the widget runs a website-only agent with a reduced tool set, separate from the internal agent. Nov 11, 2026: the director ran two test conversations; Claude reviewed the transcripts and the team-chat log. Intake, availability check, and handoff to the manager worked. Incomplete and abusive inputs not yet tested; no test record published here |
| Website scheduling: availability check and 24-hour hold | Live | Director-reported | Hold is not confirmed until the session fee is paid ([ADR-008](../decisions/008-website-chat-with-in-conversation-tools.md)). A server-side limit on holds was added Nov 11, 2026. In the Nov 11 test, a second hold for the same visitor was refused, no invoice was sent, and the request went to human review. Two defects found: the handoff card mislabeled the request type and sent it through an unneeded booking check, and the agent's closing wording implied a session after the refusal. Fixes for both were published Nov 11, 2026 and checked only with simulated test data; not yet verified in a live conversation |
| Phone intake | In progress | Not yet verified | The reception voice agent exists but does not answer phone calls yet |
| Intake into the CRM, end to end | In progress | Not yet verified | No end-to-end test lead recorded |
| Member-portal avatar | Live | Not yet verified | Moved from the public site to the member portal Oct 21, 2026 |
| Proposal & SOW: drafting | Live | Director-reported | Drafts pass a director review gate before any quote |
| Proposal & SOW: quotes and payment | In progress | Not yet verified | Moving to the payment processor and its client portal; portal configured Oct 16, 2026 (director-reported) ([ADR-005](../decisions/005-quotes-and-payments-via-payment-processor.md)) |
| Handoff approvals in team chat | Live | Director-reported | Approval cards with approve/return buttons for handoffs that need director review |
| Automatic routing of routine handoffs to the receiving agent | In progress | Not applicable | Built but switched off until the receiving workflows are chosen. Routine handoffs are logged and posted to team chat, but no agent picks them up automatically yet |
| Live operations dashboard | Live | Director-reported | Fed by per-step events from the workflow engine ([ADR-007](../decisions/007-agent-identity-and-observability.md)) |
| Individual agent identities in team chat | In progress | Not yet verified | Each agent as its own chat app, linked to its voice agent |
| Orchestrator: daily briefing, routing, review | In progress | Not yet verified | |
| Delivery Tracker | In progress | Not yet verified | Availability check is live through website scheduling; milestone tracking in progress |
| Workflow Audit | In progress | Not yet verified | Workflow-failure alerts to be routed through this agent (designed) |
| GRC Assessment | On hold | Not yet verified | Base workflow built; to run inside the proposal chain once resumed |
| Multi-agent proposal chain | Designed | Not applicable | Research → timeline → orchestration plan → draft → review → director |
| Scheduling coordination across calendars | Designed | Not applicable | Single coordinator, rules per calendar type, director approval on conflicts. Website availability check and hold are live (above) |
| Content engine | Designed | Not applicable | Draft → manager review (max two revisions) → director |
| Outbound calling | Designed | Not applicable | Warm leads plus a director-approved cold list only |

## Evidence gaps to close

1. A recorded external-exposure test for the infrastructure (method, vantage point, date, results), replacing the director-reported entries above.
2. Website channel: a published test record, plus test conversations with incomplete and abusive inputs (normal-path and repeat-hold tests were run Nov 11, 2026; see above).
3. An access-control review of the website chat and its tools, recorded once complete.
4. An end-to-end intake test lead into the CRM.

## Next up

1. Close the evidence gaps above.
2. Finish the Orchestrator, Delivery Tracker, and Workflow Audit workflows.
3. Complete the payment-processor quote flow.
4. Resume GRC Assessment inside the proposal chain.
