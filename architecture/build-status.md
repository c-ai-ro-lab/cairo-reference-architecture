# Build Status

Where the CAIRO operating system stands. Updated as components move from design to production. Component names are generic; see the [operating model](multi-agent-operating-model.md) for what each role does.

**Last updated:** October 16, 2026

| Status | Meaning |
|---|---|
| ✅ Live | Running in production |
| 🔧 In progress | Being built or tested |
| 📐 Designed | Architecture decided, build not started |
| ⏸ On hold | Partly built, paused for higher priorities |

## Infrastructure

| Component | Status | Notes |
|---|---|---|
| Self-managed workflow engine and local LLM on a hardened VPS | ✅ Live | |
| Zero-trust admin access | ✅ Live | Access resource points at the internal container name, not the public IP ([ADR-001](../decisions/001-zero-trust-admin-access.md)) |
| Outbound tunnel with webhook-only path allowlist | ✅ Live | ([ADR-002](../decisions/002-expose-only-webhook-paths.md)) |
| Container ports bound to loopback, verified closed from outside | ✅ Live | Fix applied and verified October 12, 2026 ([ADR-003](../decisions/003-docker-bypasses-ufw.md)) |
| All edge containers consolidated under one Compose project | 📐 Designed | The [reference stack](../reference-stack/docker-compose.yml) shows the target state |
| Secret scanning and tests on every push to this repository | ✅ Live | |

## Agents and workflows

| Component | Status | Notes |
|---|---|---|
| Reception: phone intake | 🔧 In progress | Voice agent live; end-to-end test lead into the CRM pending |
| Reception: website avatar chat | 🔧 In progress | Avatar live on the public site; post-conversation webhook into the intake pipeline being built ([ADR-006](../decisions/006-website-intake-through-one-pipeline.md)) |
| Proposal & SOW: drafting | ✅ Live | Draft goes through a director review gate before any quote |
| Proposal & SOW: quotes and payment | 🔧 In progress | Moving from CRM-native quotes to the payment processor with a client portal ([ADR-005](../decisions/005-quotes-and-payments-via-payment-processor.md)) |
| Handoff approvals in team chat | ✅ Live | Approval cards with approve/return buttons |
| Live operations dashboard | ✅ Live | Fed by per-step events from the workflow engine ([ADR-007](../decisions/007-agent-identity-and-observability.md)) |
| Individual agent identities in team chat | 🔧 In progress | |
| Orchestrator: daily briefing, routing, review | 🔧 In progress | Current build priority |
| Delivery Tracker: timelines and milestone tracking | 🔧 In progress | Current build priority |
| Workflow Audit | 🔧 In progress | Current build priority |
| GRC Assessment | ⏸ On hold | Base workflow built; runs inside the proposal chain once resumed |
| Multi-agent proposal chain | 📐 Designed | Research → timeline → orchestration plan → draft → review → director |
| Scheduling coordination across calendars | 📐 Designed | Single coordinator, rules per calendar type, director approval on conflicts |
| Content engine | 📐 Designed | Draft → manager review (max two revisions) → director |
| Outbound calling | 📐 Designed | Warm leads plus a director-approved cold list only |

## Next up

1. Finish the Orchestrator, Delivery Tracker, and Workflow Audit workflows.
2. Connect website chat leads to the intake pipeline and run end-to-end tests on both intake channels.
3. Complete the payment-processor quote flow.
4. Resume GRC Assessment inside the proposal chain.
