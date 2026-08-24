# Tor transport threat model

## Security goals

- Keep onion private keys isolated per Tor process and out of application logs.
- Preserve the direct HTTPS path when Tor is disabled, degraded, or unavailable.
- Publish only public endpoint and coarse health metadata.
- Avoid using Tor as an authentication, authorization, or jurisdiction bypass.

## Threats and mitigations

| Threat | Mitigation |
| --- | --- |
| Private-key disclosure | Separate data volumes; the metadata service mounts only status data; secret-shaped configuration fields are rejected. |
| Malicious discovery data | Strict onion URL and instance ID validation; loopback binding; `no-store` responses; operators add TLS/auth before external exposure. |
| Failed or partitioned instance | Health status fails closed; deterministic priority selection; independent HTTPS fallback remains available. |
| Correlation and traffic analysis | No anonymity guarantee is claimed; operators should avoid identifying logs and use normal data-minimization controls. |
| Stale/compromised onion key | Staged rotation with a new volume and explicit endpoint withdrawal; never clone one key across active instances. |
| Policy bypass | Gateway authentication and jurisdiction controls are unchanged and execute behind both transports. |

## Out of scope

This profile does not promise censorship resistance, user anonymity, protection
from a global traffic observer, or automatic key escrow. It does not modify
Gateway authorization and must not be used to evade legal or platform controls.
