# FAIR Risk Analysis Example: Exposed Automation Admin Interface

A worked example of [Factor Analysis of Information Risk (FAIR)](https://www.fairinstitute.org/what-is-fair) applied to the scenario behind [ADR-003](../decisions/003-docker-bypasses-ufw.md). It shows how a technical finding is translated into financial terms a business owner can act on.

> **The figures below are illustrative estimates for a small consulting business**, chosen to demonstrate the method. A client engagement replaces them with that organization's own data.

## Scenario

| Element | Definition |
|---|---|
| **Asset** | Self-managed workflow engine holding CRM, LLM, and payment-integration credentials |
| **Threat community** | Opportunistic external attackers running automated internet-wide scans |
| **Threat event** | Attacker discovers the exposed admin interface and attempts to gain access |
| **Loss event** | Attacker gains access and uses stored credentials (data theft, CRM tampering, API abuse) |

## Loss Event Frequency

| Factor | Estimate (min / most likely / max) | Reasoning |
|---|---|---|
| Threat Event Frequency | 50 / 200 / 1,000 per year | Exposed admin panels are found by scanners within days; login attempts are routine |
| Vulnerability (probability an attempt succeeds) | 0.5% / 2% / 10% | Strong unique password, but no MFA and exposure to unpatched vulnerabilities |
| **Loss Event Frequency** | **~0.25 / 4 / 100 per year** → modeled conservatively at **~1–4 per year** | Upper tail capped: a single compromise would end the exposure |

## Loss Magnitude (per event)

| Loss form | Estimate (min / most likely / max) |
|---|---|
| Response (investigation, credential rotation, rebuild) | $1,500 / $4,000 / $12,000 |
| Productivity (automations down, manual workarounds) | $500 / $2,500 / $8,000 |
| Replacement (API abuse charges, e.g. LLM tokens) | $0 / $1,000 / $15,000 |
| Reputation (lost deals, client trust) | $0 / $10,000 / $75,000 |
| Fines and judgments (breach notification for client PII) | $0 / $2,000 / $50,000 |
| **Total per event** | **~$2,000 / ~$19,500 / ~$160,000** |

## Annualized Loss Exposure

Using the most-likely values: **~2 events/year × ~$19,500 ≈ $39,000/year**, with a long tail driven mainly by reputation and notification costs.

## Treatment and residual risk

| Control | Effect on the model |
|---|---|
| Remove published ports (bind to loopback / internal networks) | Threat Event Frequency from the internet drops to near zero |
| Admin access through zero-trust with identity and device checks | Vulnerability drops sharply for any remaining attempt |
| Webhook-only exposure behind a path allowlist | Admin interface unreachable through the public path |
| Verification from outside after every change | Reduces the chance the exposure silently returns |

**Cost of treatment:** a few hours of configuration plus an existing zero-trust subscription.
**Residual annualized exposure:** estimated in the low hundreds of dollars per year, driven by zero-trust provider or insider scenarios.

**Decision:** Treat. The control cost is small relative to a five-figure annualized exposure.

## Why this matters for clients

Most small businesses cannot prioritize security work from a list of technical findings. Expressing each finding as an expected annual loss, with a control cost beside it, lets an owner make the decision in the same terms as any other business investment.
