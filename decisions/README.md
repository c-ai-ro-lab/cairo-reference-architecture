# Architecture Decision Records

Each record captures one significant decision: the context, the options considered, what was chosen, and the consequences. They are written when the decision is made and amended, not rewritten, when circumstances change.

| # | Decision | Status |
|---|---|---|
| [001](001-zero-trust-admin-access.md) | Admin access through zero-trust, not open ports or VPN | Accepted |
| [002](002-expose-only-webhook-paths.md) | Expose only webhook paths, through an outbound tunnel and a path allowlist | Accepted |
| [003](003-docker-bypasses-ufw.md) | Never publish container ports to all interfaces; verify exposure from outside | Accepted |
| [004](004-human-approval-gates-for-agents.md) | Agents propose, humans approve consequential actions | Accepted |
| [005](005-quotes-and-payments-via-payment-processor.md) | Quotes and payments through the payment processor, not the CRM | Accepted |
| [006](006-website-intake-through-one-pipeline.md) | Website avatar intake feeds the same pipeline as phone intake | Accepted, in progress |
| [007](007-agent-identity-and-observability.md) | Every agent has its own identity, and every step is observable | Accepted, in progress |
