# Security Policy

## Reporting a vulnerability

If you find a security issue in any template or workflow in this repository, please report it privately to **compliance@cairosol.com** rather than opening a public issue.

Please include:

- The file and line (or workflow node) involved
- What an attacker could do with it
- Steps to reproduce, if you have them

We aim to acknowledge reports within **3 business days** and to share a remediation plan within **10 business days**.

## Scope

This repository contains reference templates only. It does not describe or connect to any live CAIRO Solutions or client environment, and testing against systems you do not own is out of scope and not authorized.

## Secrets

This repository must never contain credentials. Every push is scanned by [gitleaks](https://github.com/gitleaks/gitleaks) (see `.github/workflows/secret-scan.yml`). If you believe a secret has been committed, report it to the address above immediately so it can be rotated.
