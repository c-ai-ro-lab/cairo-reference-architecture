# Reference Stack

A hardened Docker Compose template implementing [the architecture overview](../architecture/overview.md).

## Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | All five services under one Compose project, segmented across three networks |
| `.env.example` | Every variable the stack needs, with no values. Copy to `.env` locally. |
| `nginx/webhook-allowlist.conf` | Forwards only n8n webhook paths; returns 403 for everything else |
| `cloudflared/config.yml.example` | Tunnel ingress rules for a locally-managed tunnel: webhook host to nginx, everything else refused |

## Deploying

1. Copy `.env.example` to `.env` and fill in values from your password manager.
2. In the Cloudflare dashboard, route the tunnel's public hostname to `http://nginx-webhooks:80`.
3. In your zero-trust console, create a resource pointing at `n8n` on port `5678` (the container name on the Docker network, not the server's public IP).
4. `docker compose up -d`

## Verifying from the outside

Do not trust the configuration. Test it from a machine that is **not** on the zero-trust network:

```bash
# Should time out or be refused: n8n is not published
curl -m 5 http://<server-public-ip>:5678

# Should time out or be refused: Ollama is not published
curl -m 5 http://<server-public-ip>:11434

# Should return 403: admin UI blocked at the proxy
curl -i https://<webhook-host>/

# Should return 404 from n8n (unknown webhook) — proves the allowlist path works
curl -i https://<webhook-host>/webhook/does-not-exist
```

Then confirm admin access works **only** with the zero-trust client connected.

## Not included

- Backups (back up the `n8n_data` volume and the encryption key separately)
- Monitoring and alerting
- Host hardening (SSH key-only auth, automatic security updates, fail2ban)

These are covered in client engagements and are environment-specific.
