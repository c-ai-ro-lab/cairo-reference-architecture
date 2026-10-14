# ADR-003: Never publish container ports to all interfaces; verify exposure from outside

**Status:** Accepted

## Context

During a security review, the host firewall (`ufw`) was active and reported that only SSH (port 22) was allowed in. By that evidence, the server was locked down.

It was not. The n8n port and the local LLM port were both reachable from the open internet.

## Root cause

Docker manages its own `iptables` rules. When a container port is published (for example `"5678:5678"`), Docker inserts a rule into its own chain, which is evaluated **before** the chains `ufw` controls. The `ufw` status output is accurate about `ufw`'s rules. It says nothing about Docker's.

Both services had been published with Docker's default binding, which is all interfaces (`0.0.0.0`). The firewall never saw the traffic.

## Decision

1. **No container publishes a port to all interfaces.** Services communicate over Docker networks by container name. If a port must be published for local debugging, it is bound to loopback (`127.0.0.1:5678:5678`).
2. **Exposure is verified from outside the server**, from a network that is not on the zero-trust connection, after every infrastructure change. A firewall's own status report does not count as verification.
3. The zero-trust access resource for n8n was changed from the server's public IP to the container's internal name (see ADR-001).

## Verification performed

- Requests to both ports on the public IP from an outside network: refused / timed out.
- Admin UI reachable only with the zero-trust client connected.
- Webhooks still reachable through the tunnel and allowlist (ADR-002).

## Consequences and lessons

- This is a common misconfiguration because the tool that reports "protected" is not the tool that controls the traffic. Any server running Docker plus a host firewall should be checked for it.
- It reinforced a working rule for every client build: **test controls from the attacker's position, not the administrator's.**
- The fix cost minutes. The exposure window was the time between deployment and the review. Reviews now happen at deployment, not after.
