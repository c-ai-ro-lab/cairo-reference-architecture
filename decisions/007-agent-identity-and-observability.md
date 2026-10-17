# ADR-007: Every agent has its own identity, and every step is observable

**Status:** Accepted (October 2026). Dashboard live; individual chat identities in progress.

## Context

With several agents handing work to each other, two questions became hard to answer:

- **Who did this?** When all agent messages came from one shared bot, it was unclear which agent produced a message or made a request.
- **What is happening right now?** Status lived in scattered execution logs. The director had no single view of what was in flight or what was waiting on him.

## Decision

1. **One chat identity per agent.** Each agent posts in the team chat as its own app, so every message is attributable.
2. **One approval bot.** A single dedicated bot posts approval cards with approve/return buttons. Approvals are never mixed in with ordinary agent chatter.
3. **Every agent step emits an event.** The workflow engine sends a small event (agent, run, step, status) at each step to an internal endpoint on the operations dashboard.
4. **A live operations dashboard** shows:
   - an org chart built from each agent's reporting line in the agent registry,
   - lanes for in-flight runs,
   - an activity feed,
   - a "waiting on you" strip for items that need the director.

## Consequences

- Every action has an owner, which supports audit trails for clients who ask how AI work is supervised.
- The director sees blocked work without searching for it.
- The agent registry becomes the source for reporting lines, so changing a manager updates the org chart automatically.
- Events should carry run metadata only, not client data, so personal information stays out of the dashboard feed.
- Maps to NIST AI RMF *Govern* (accountability) and *Manage* (monitoring); see the [governance mapping](../governance/nist-ai-rmf-mapping.md).
