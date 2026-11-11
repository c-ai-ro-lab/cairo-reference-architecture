# ADR-008: Website chat uses a conversational widget with in-conversation tools

**Status:** Accepted (October 21, 2026). Supersedes [ADR-006](006-website-intake-through-one-pipeline.md) for the public website. Live; not yet verified (see [build status](../architecture/build-status.md)).

## Context

[ADR-006](006-website-intake-through-one-pipeline.md) put a video avatar on the public website and planned to send each conversation to the intake pipeline through a post-conversation webhook and an adapter. Two limits emerged:

- The avatar could not act during the conversation. Intake, availability, and booking would all happen afterward, in a separate loop.
- The avatar could not be connected to the reception agent's existing voice-platform configuration, so it ran on separate instructions.

The reception agent already runs on a conversational voice platform that can call tools while the conversation is in progress.

## Options considered

1. **Keep the avatar** and finish the post-conversation adapter. Visual presence on the site; no in-conversation actions.
2. **Use the voice platform's conversational widget** (voice and text) on the public site, bound to the existing reception agent and its tools.

## Decision

Option 2, decided by the director on October 21, 2026.

- The public site embeds the voice platform's widget. Every "Request a Consultation" button opens it.
- During the conversation the reception agent can:
  - submit the lead to the **same intake pipeline** used by other channels,
  - check the director's availability through the Delivery Tracker,
  - after the visitor confirms the time and their email, place a **24-hour hold** and email the fixed-price strategy-session invoice. The hold is not confirmed until the invoice is paid.
- The video avatar moves to the member portal only.
- The reception agent stays selectable in the internal operations dashboard for testing.

## Consequences

- Website leads enter the intake pipeline during the conversation. The post-conversation adapter planned in ADR-006 is no longer needed for the public site.
- The visitor can book without waiting for an email loop.
- **Departure from the published operating model.** The [scheduling section](../architecture/multi-agent-operating-model.md#scheduling) routes bookings through a single coordinator, and [ADR-004](004-human-approval-gates-for-agents.md) requires human approval for external or binding actions. Here the reception agent places a hold and sends a fixed-price invoice without per-booking approval. This rests on the director's October 21 decision. **Open question for the director:** record it as a standing approval for the fixed-price session in ADR-004, or route these actions back through an approval step.
- A public widget that can call tools is an abuse surface (spam leads, unwanted holds or invoices, usage cost). The widget's access controls and the tools' limits will be reviewed and recorded before this channel is marked verified.
- Vendor-side controls recorded in ADR-006 applied to the avatar as deployed on the public site at that time. They are not evidence for this widget.
