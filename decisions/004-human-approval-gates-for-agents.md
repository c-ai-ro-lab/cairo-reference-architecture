# ADR-004: Agents propose, humans approve consequential actions

**Status:** Accepted

## Context

The operating model uses several specialized AI agents: intake, proposal generation, GRC assessment, delivery tracking, content, and workflow audit. They hand work to each other. Without explicit limits, a chain of agents could draft a proposal, price it, and send it to a prospect with no person ever looking at it.

## Decision

Every agent action is classed as one of three types:

| Class | Examples | Rule |
|---|---|---|
| **Internal and reversible** | Summarize a lead, score it, draft a document, update a status field | Agent acts on its own; the action is logged |
| **Agent-to-agent handoff** | Intake → proposal, content → review | Posted as an approval card in a team channel; the director approves or returns it |
| **External or binding** | Sending a quote, publishing content, contacting a cold lead, committing spend | Requires explicit human approval at a review gate. No exceptions. |

Additional rules:

- **Reviewing agents may send work back** to the originating agent before it reaches the director. Loops are capped (for example, two revisions) before escalating to a person, so agents cannot iterate indefinitely.
- **When the director rejects work**, the director states the reason and chooses which agent it returns to. Rejection routing is a human decision, not an automated rule.
- **Inbound data from trusted channels** (for example, a client submitting an intake form) may be written to the CRM automatically. **Outbound lists** (prospects the business will contact) require review before entering the CRM.

## Consequences

- Throughput is limited by human review at the gates. That is intentional: the gates sit on the actions where errors are expensive or public.
- Every gate produces an approval record, which provides an audit trail for clients who ask how AI decisions are supervised.
- Maps directly to NIST AI RMF *Govern* and *Manage* functions (see [governance mapping](../governance/nist-ai-rmf-mapping.md)).
