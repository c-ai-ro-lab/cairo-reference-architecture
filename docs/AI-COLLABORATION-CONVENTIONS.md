# AI Collaboration & Attribution Conventions

**Status:** Proposed working convention — subject to director approval  
**Scope:** GitHub contributions to the CAIRO reference architecture and, where adopted, other CAIRO repositories.

## Purpose

CAIRO uses AI assistants for different parts of research, systems design, implementation, and review. This document establishes a traceable record of **who contributed what**, **what was tested**, and **what an authorized person actually approved**. Attribution should be accurate without overstating either AI capabilities or human verification.

The repository's existing [publication and evidence policy](PUBLICATION-AND-EVIDENCE-POLICY.md) and [security policy](../SECURITY.md) take precedence on claims and disclosures.

## Branch naming conventions

Use descriptive branches prefixed according to the AI assistant responsible for the proposed change:

- `claude/<short-purpose>` — work prepared primarily with Claude.
- `chatgpt/<short-purpose>` — work prepared primarily with ChatGPT.
- `perplexity/<short-purpose>` — research or patches prepared primarily with Perplexity, if granted suitable repository permissions.
- `human/<short-purpose>` — work prepared without a principal AI collaborator.

These prefixes are coordination cues, **not proof of authorship, independent review, or authorization**. Work involving several systems should name each actual contribution in the PR description. Do not infer author identity from the GitHub account's commit author or a branch name alone.

## Pull request disclosures

Every substantive PR should record:

1. **Origin and scope:** issue or requirement, what files or components changed, and why.
2. **AI collaboration:** which assistants were used and their actual roles (research, drafting, code generation, review, testing suggestions); write “None” if no AI contributed.
3. **Human involvement:** decisions, edits, tests, and approvals actually performed by people; mark pending review accurately.
4. **Evidence:** checks actually run, observed results, environment and limitations. Separate suggested tests from executed tests.
5. **Risks and publication boundaries:** unresolved questions, potentially sensitive details, and whether public disclosure is appropriate.

Use the repository [pull request template](../.github/PULL_REQUEST_TEMPLATE.md). Its checkboxes are statements about work completed, **not automatic assurances**.

## AI research, review, and testing

- Treat outputs from Claude, ChatGPT, Perplexity, and any other assistants as **review inputs**, not independently established facts.
- Verify citations against original authoritative sources and applicability to the system/version under discussion.
- Do not label an AI cross-review “independently evaluated.” A genuine external review identifies its reviewer, scope, method, date, and limitations.
- Report test outcomes only after the test actually runs. Document when CI or a tool did not run or results were unavailable.
- Use the private vulnerability reporting channel described in [SECURITY.md](../SECURITY.md) for sensitive findings; do not publish exploitable details merely to enable collaboration.

## Collaboration boundaries

- Create separate branches and submit focused PRs; avoid direct pushes to the protected mainline. GitHub protections must be configured separately to enforce this practice.
- Coordinate ownership through issues, PR descriptions, and reviews. Avoid changing another contributor's open PR without agreement.
- Never merge, deploy, alter production, publish private information, or accept risk based solely on one AI's recommendation.
- An authorized human must approve consequential changes. GitHub review settings and branch protection are separate controls, and should reflect the actual reviewer arrangement.

## Existing history

The convention is **prospective**. Do not rewrite old commits or imply that branch names can establish who drafted historic changes.

When retrospective attribution is appropriate, append a clearly dated note to the relevant PR or decision record stating:
- which AI system drafted or submitted the content, if known;
- which human authorized it, if known;
- which verification took place, if known; and
- what cannot be substantiated.

Do not retroactively assert reviews or tests for which no evidence exists.

## Ownership and maintenance

The director retains final approval and determines access privileges. Collaborator responsibilities are practical defaults and can change by task. Update this document in a reviewable PR whenever the process changes materially.
