# CAIRO Reference Architecture

**Secure, governed AI automation for small and mid-sized organizations.**

This repository documents how [CAIRO Solutions](https://cairosol.com) designs, secures, and governs AI automation systems. It is a reference architecture: the patterns, templates, and decisions behind our builds, published so that clients, partners, and reviewers can see how we work before they hire us.

It is **not** a copy of any live environment. Every value that identifies real infrastructure (IP addresses, hostnames, account IDs, credentials) has been replaced with a placeholder.

---

## What's inside

| Folder | What it shows |
|---|---|
| [`architecture/`](architecture/) | How the stack is put together, how traffic is allowed in (and kept out), and how AI agents hand off work under human supervision |
| [`reference-stack/`](reference-stack/) | A hardened Docker Compose template for a self-managed n8n + local LLM stack |
| [`workflows/client-intake-agent/`](workflows/client-intake-agent/) | A complete, documented AI intake workflow: validation, structured LLM output, CRM write, error handling |
| [`decisions/`](decisions/) | Architecture Decision Records: what we chose, what we rejected, and why |
| [`governance/`](governance/) | How workflows map to the NIST AI Risk Management Framework, plus a worked FAIR risk analysis |

## Design principles

1. **Nothing is exposed by default.** Admin interfaces are reachable only through zero-trust access. The public internet sees exactly the webhook paths a workflow needs, and nothing else.
2. **Verify, don't assume.** A firewall that *looks* closed is not the same as a port that *is* closed. Every control is tested from the outside. ([ADR-003](decisions/003-docker-bypasses-ufw.md) is the story of why.)
3. **AI output is untrusted input.** Every LLM response is parsed against an explicit schema before it touches a system of record.
4. **Humans approve consequential actions.** Agents draft, score, and route. A person approves anything that commits the business or reaches a customer.
5. **Governance is designed in, not bolted on.** Each workflow is mapped to NIST AI RMF functions and assessed with FAIR before it goes to production.
6. **Secrets never live in code.** Credentials sit in a password manager and are injected at runtime. This repo is scanned for secrets on every push.

## Build pipeline

```
Design (architecture + risk review)
   → Prototype (low-code sandbox)
   → Validate (test payloads, failure cases, governance checklist)
   → Migrate to production runtime (self-managed n8n)
   → Version control (this pattern, in a private repo per environment)
```

## About

CAIRO Solutions LLC is a Sacramento-based AI automation agency working across four practice areas: **AI Architecture, AI Strategy, Governance/Risk/Compliance (GRC), and Orchestration.**

The director operates as architect and orchestrator: designing systems, setting security and governance requirements, and directing AI-assisted builds against those requirements. This repository is an honest record of that work.

- Website: [cairosol.com](https://cairosol.com)
- Security issues: see [SECURITY.md](SECURITY.md)

## License

Copyright (c) 2026 CAIRO Solutions LLC. All rights reserved. This repository is published for viewing and evaluation only; see [LICENSE](LICENSE). For licensing or partnership inquiries, contact compliance@cairosol.com.
