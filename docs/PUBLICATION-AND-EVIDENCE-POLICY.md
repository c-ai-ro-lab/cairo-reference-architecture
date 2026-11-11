# Publication & Evidence Policy

**Status:** Proposed for review  
**Applies to:** Public documentation, samples, case studies, issues, pull requests, tutorials, diagrams, videos, and workshop materials derived from CAIRO work.

## Purpose

CAIRO publishes reference material so technical communities can examine architecture choices and provide constructive critique. Transparency is valuable only when the information is accurate, appropriately scoped, and safe to share.

The [repository README](../README.md) distinguishes reference material from live environments. This policy is intended to strengthen that distinction—not authorize disclosure of live configurations or customer information.

## What may be published

- Sanitized architecture patterns, representative diagrams, configuration templates, and sample payloads.
- Design decisions and tradeoffs, including rejected approaches and known limitations.
- Reproducible test instructions for isolated or authorized environments.
- Observed test outcomes where the environment, method, date, and limitations can be accurately described.
- Personal learning labs clearly labeled as educational rather than production-ready.
- Educational articles and media derived from previously approved public information.

## What must not be published

- Secrets, tokens, private keys, passwords, session artifacts, or real connection strings.
- Customer or prospect data, private conversations, proprietary deliverables, or identifiers without explicit permission.
- Internal-only IPs, hostnames, account identifiers, topology, security settings, or operational logs where disclosure increases risk.
- Vulnerability details that could expose an unpatched live system; use the private path in [SECURITY.md](../SECURITY.md).
- Unapproved screenshots or vendor/client materials, or content not licensed for public redistribution.
- Claims of certification, compliance, security assurance, third-party review, or production readiness without substantiation.

Before sharing diagnostics or redacted screenshots, check metadata, filenames, embedded URLs, and commit history—not just visible text. Sanitization should replace sensitive details with unambiguous placeholders, not merely blur an image.

## Evidence standards

Public engineering claims should disclose:

1. **Claim and scope:** precisely what was checked and where.
2. **Evidence:** relevant commands, test descriptions, artifacts, or documented observations, without secrets.
3. **Date or version:** when the observation occurred or which revision it concerns.
4. **Reviewer:** whether the work was self-reported, human-reviewed internally, or externally assessed.
5. **Limitations:** exclusions, unresolved risks, environmental dependencies, and any tests not performed.

Use accurate language:
- *Designed* is not *implemented*.
- *Implemented* is not *tested*.
- *Internally tested* is not *independently audited*.
- *Security-conscious design* is not *security certification*.
- *AI-generated recommendation* is not *verified fact*.

If a source cannot be corroborated, mark it as an assumption or remove the claim. Correct or retract outdated public material rather than silently preserving a misleading statement.

## AI-assisted authorship and accountability

AI tools may draft code, prose, summaries, tutorials, diagrams, and content scripts. For material claims, identify what humans actually reviewed and what tests actually ran. Do not imply that model output is an independent assessment or that a suggested check was executed.

The director or an explicitly authorized reviewer approves consequential publication. External specialists should be credited only for work they performed, and their conclusions must not be extended beyond their stated scope.

## Review before publication

- [ ] The material serves a clear purpose and identifies its intended audience.
- [ ] No secrets, private identifiers, client data, or unsafe operational details are included.
- [ ] Security-sensitive findings were routed through the private disclosure policy.
- [ ] Technical claims match traceable evidence and current build status.
- [ ] Proposed designs, lab exercises, and production behavior are clearly differentiated.
- [ ] Any AI contribution and human review are represented accurately.
- [ ] Images, code, logos, screenshots, quotations, and datasets may be shared.
- [ ] The repository's existing copyright and [LICENSE](../LICENSE) are respected.
- [ ] A responsible human has approved publication.

## Community critique

Invite issues and pull requests for clarity, reproducibility, design alternatives, and documentation errors. Do **not** invite unauthorized testing of live environments. Security reports belong in the private channel described in [SECURITY.md](../SECURITY.md).

## Relationship to other documents

This is a **draft publication policy** and should not supersede contractual, legal, client, organizational, or regulatory obligations. It complements the [Applied AI Engineering Methodology](AI-ENGINEERING-METHODOLOGY.md), existing architecture decision records, and the repository security policy.
