# ADR-005: Quotes and payments through the payment processor, not the CRM

**Status:** Accepted (October 2026). Supersedes the earlier choice of CRM-native quotes.

## Context

The Proposal agent was first designed to issue quotes as native CRM quote objects, so a client could review, sign, and pay from one link. In practice, generating quotes in the CRM requires a higher paid tier than the business currently holds. The business already runs a payment processor with separate production and sandbox accounts.

## Options considered

1. **Upgrade the CRM tier** to unlock native quotes. Adds recurring cost for a single feature.
2. **Branded document quotes** (word processor or PDF), with payment handled separately. Better branding, but signing and paying become separate steps for the client.
3. **Quotes and payment through the payment processor,** with its hosted customer portal.

## Decision

Option 3. Approved proposals become quotes and payment links in the payment processor. Clients manage invoices, payment methods, and receipts in the processor's customer portal. The CRM keeps the deal record and receives the outcome.

## Consequences

- No CRM upgrade needed, and the payment step uses an existing, compliant processor rather than custom code.
- Clients get self-service access to their billing history.
- The director review gate is unchanged: nothing is quoted or sent until a person approves the proposal.
- New work: keeping deal status in the CRM synchronized with payment events, and testing everything in the sandbox account before production.
