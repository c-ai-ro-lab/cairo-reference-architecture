# CAIRO Applied AI Engineering Methodology

**Status:** Proposed working methodology — for review and refinement  
**Scope:** How CAIRO frames, directs, tests, and documents AI-assisted systems work  
**Audience:** Clients, collaborators, technical reviewers, and learners

> This document describes a proposed repeatable practice, not a certification, independently validated standard, or claim that every historical project followed every step. The [architecture records](../decisions/), [build status](../architecture/build-status.md), and project-specific evidence remain authoritative for what was actually built and checked.

## Purpose

CAIRO approaches AI as one component of a system involving people, business processes, data, networks, infrastructure, vendors, and risk. The director's role is to define the problem and constraints, make design and acceptance decisions, direct AI-assisted implementation, and ensure that important claims are checked against observable evidence.

The process is iterative. Security, privacy, and governance considerations should be revisited at **every** stage, not deferred until a final review.

## The six-stage design cycle

| Stage | Questions | Typical artifacts |
|---|---|---|
| **1. Understand** | Who benefits? What is the business problem, baseline process, desired outcome, and scope? | Problem statement, stakeholders, requirements, success criteria |
| **2. Design** | How do users, agents, data, systems, and trust boundaries interact? What are the alternatives? | Workflow map, architecture diagram, data-flow and threat notes, decision record |
| **3. Orchestrate** | Which human or AI-assisted tasks and tools fit the constraints? Where are approval gates? | Implementation plan, scoped tasks, tool selection and handoff model |
| **4. Secure** | What could fail, leak, be misused, or act beyond authority? What controls are appropriate? | Access and secrets plan, control review, risk register or assessment |
| **5. Verify** | Does the system actually behave as intended, including failure cases and external exposure? | Tests, observed outputs, independent checks where feasible, limitations |
| **6. Improve** | What changed after feedback? What is documented, owned, monitored, and next? | Updated ADRs, runbooks, status, follow-up issues, learning notes |

A step is not “complete” merely because an AI model produced plausible text. Completion depends on the acceptance criteria and evidence suitable for the system's risk.

## Division of responsibility

**Human direction and accountability**
- Define the business goal, non-negotiable constraints, and acceptable risk.
- Decide what data and tools can be used, and who may authorize consequential actions.
- Review architectural tradeoffs, approve releases, and resolve ambiguity.
- Confirm whether evidence supports published statements; consult qualified specialists when the work exceeds the team's capabilities.

**AI-assisted contribution**
- Help research alternatives, organize requirements, draft designs and code, propose tests, and prepare documentation.
- Surface assumptions and uncertainty instead of presenting guesses as verification.
- Remain subject to review, access controls, and human approval gates.

**Other contributors and external specialists**
- Record their role and review scope when relevant; do not describe AI-generated text as independent audit or expert sign-off.

See the existing [multi-agent operating model](../architecture/multi-agent-operating-model.md) and [human-approval decision](../decisions/004-human-approval-gates-for-agents.md) for system-specific agent responsibilities.

## Minimum evidence for a meaningful change

When applicable, connect the following in an issue or pull request:

1. **Intent:** requirement, user need, or failure being addressed.
2. **Design:** change in behavior, data flow, privileges, integrations, or architecture; link an ADR if the decision has lasting consequences.
3. **AI involvement:** where AI assisted and what a human actually reviewed or revised.
4. **Validation:** commands, test environment, expected/observed results, and negative or failure cases.
5. **Risk:** new dependencies, exposure, data handling, rollback path, and remaining limitations.
6. **Status:** clearly distinguish proposed, implemented, internally verified, independently evaluated, and production-operational claims.

Documentation-only work may mark non-applicable items as such; it should not invent test results.

## Example: checking external exposure

[ADR-003](../decisions/003-docker-bypasses-ufw.md) documents a case where host firewall status alone did not establish container network isolation. The recorded response was to change port binding and verify behavior from outside the host.

This is **CAIRO's documented verification**, not an independent third-party security assessment. The transferable lesson is to test a security control from the perspective relevant to the threat, not rely solely on the configuration tool's report. Reproduce any test only on systems you own or are explicitly authorized to test.

## Honest progress reporting

Use these terms consistently:

| Label | Meaning |
|---|---|
| **Proposed / Designed** | Intent or architecture exists; implementation not established |
| **In progress** | Build or testing is incomplete |
| **Implemented** | The change has been applied in the described scope |
| **Internally verified** | CAIRO has recorded a relevant test and its observed result |
| **Independently evaluated** | An identified outside reviewer assessed the specified scope; provide evidence and limits |
| **Live / Operational** | Running in the stated environment, with status and evidence checked for currency |

Do not equate internal checks with certification, a penetration test, or a guarantee of security. The [build-status document](../architecture/build-status.md) uses its existing labels and is the source for component status.

## Continuous learning and review

This is a living practice. As CAIRO's technical capabilities, client requirements, and external feedback change, update the methodology through reviewable pull requests. Explain why a rule changed, where it applies, and whether existing project records need revision.

For what is safe and appropriate to publish, consult [Publication & Evidence Policy](PUBLICATION-AND-EVIDENCE-POLICY.md) and the repository's [Security Policy](../SECURITY.md).
