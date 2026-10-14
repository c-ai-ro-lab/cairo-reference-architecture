# ADR-001: Admin access through zero-trust, not open ports or VPN

**Status:** Accepted

## Context

The n8n editor holds every workflow and every stored credential (CRM tokens, LLM API keys, payment integrations). Whoever reaches it can read or change how the business operates. It needs to be reachable by the director from several devices and locations, and by no one else.

## Options considered

1. **Publish the n8n port with a strong password.** Simple, but the login page is exposed to every scanner on the internet, and security then depends entirely on n8n's authentication and patch level.
2. **Traditional VPN.** Better, but grants network-level access to the whole server once connected, and adds a VPN server that must itself be maintained and exposed.
3. **Zero-trust access connector.** An outbound-only connector on the server; users authenticate with identity and device checks; access is granted per resource (n8n only), not per network.

## Decision

Option 3. A zero-trust connector runs as a container on the same Docker network as n8n. The access resource points at the **container name on the internal network**, not the server's public IP.

## Consequences

- No inbound port is needed for admin access.
- Access is tied to identity and can be revoked per user or device without rotating shared secrets.
- If the zero-trust provider has an outage, admin access is unavailable. Running workflows and webhooks are unaffected. Break-glass access is SSH with a hardware-backed key.
- Pointing the resource at the public IP instead of the internal name would quietly reintroduce dependence on the public interface. That configuration error was found and corrected during review (see ADR-003).
