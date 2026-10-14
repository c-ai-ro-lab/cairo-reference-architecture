# ADR-002: Expose only webhook paths, through an outbound tunnel and a path allowlist

**Status:** Accepted

## Context

Outside services (web forms, voice agents, payment processors) must be able to call n8n webhooks. n8n serves its webhooks, its editor, its login page, and its REST API from the same port. Exposing the port for webhooks therefore exposes everything else too.

An independent architecture review flagged that, with admin access locked behind zero-trust (ADR-001), external services had no way to reach webhooks at all.

## Options considered

1. **Publish n8n's port and rely on its authentication.** Rejected for the reasons in ADR-001.
2. **Cloud reverse proxy directly to n8n.** Solves reachability, but the tunnel can then reach every n8n path, including the editor.
3. **Outbound tunnel → dedicated nginx → n8n, with a path allowlist.** The tunnel can only reach nginx; nginx forwards only `/webhook/` and `/webhook-test/` and returns 403 for everything else.

## Decision

Option 3, implemented in five phases: deploy the tunnel connector, deploy nginx with the allowlist, route the public hostname to nginx, verify from outside, then move both containers under the same Compose project as n8n (the [reference stack](../reference-stack/docker-compose.yml) shows the target state).

## Consequences

- The VPS still has no inbound ports open. The tunnel is an outbound connection.
- A leaked webhook hostname exposes only webhook endpoints, each protected by its own header token.
- Two more containers to maintain. Both are small, pinned, and read-only where possible.
- The tunnel token is a credential. During setup it was exposed in a chat transcript and was rotated the same day; tokens now live only in the password manager and are injected through `.env` at runtime.
