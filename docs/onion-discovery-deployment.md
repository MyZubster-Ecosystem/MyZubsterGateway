# Multi-host Onion discovery deployment

This document describes the optional MyZubster Onion discovery runtime added by PR #1395.

## Topology

- `windows-ha`: the existing Windows/Docker HA Onion service.
- `aruba-vps`: the independent Aruba Ubuntu VPS Onion service.
- `onion-discovery-probe`: a dedicated Tor client/probe. It does not host a hidden service and does not receive or copy hidden-service private keys.
- `gateway`: reads only the generated health snapshot and exposes discovery through `GET /api/onion/nodes`.

The two public Onion identities remain independent. Discovery chooses the lowest-priority node that has a fresh successful Tor reachability result.

## Public Onion nodes

The committed registry is `config/onion-nodes.json`. It contains only public `.onion` addresses and non-secret metadata.

Do not commit `hs_ed25519_secret_key`, Tor client-auth secrets, control passwords, wallet keys, seeds, or credentials.

## Start the discovery runtime

From the Gateway repository:

```bash
docker compose --profile onion-discovery up -d --build onion-discovery-probe gateway
```

The optional profile creates a Tor client sidecar and a shared health volume. The Gateway mounts the health data read-only.

## Environment settings

Defaults are suitable for the initial deployment. They can be overridden in `.env`:

```dotenv
ONION_DISCOVERY_MAX_STATUS_AGE_MS=120000
ONION_DISCOVERY_PROBE_INTERVAL_MS=30000
ONION_DISCOVERY_PROBE_TIMEOUT_SECONDS=60
```

The health snapshot path is wired by Docker Compose and normally should not be changed manually.

## Validate containers

```bash
docker compose --profile onion-discovery ps
```

The Gateway should remain healthy. The probe should stay running after Tor bootstraps.

Inspect probe logs:

```bash
docker logs myzubster-onion-discovery-probe --tail 100
```

## Validate generated health

```bash
docker exec myzubster-onion-discovery-probe sh -lc 'cat /health/onion-health.json'
```

Each configured node should have a record containing `healthy`, `checkedAt`, and a failure reason when unavailable.

No private Tor material should appear in this file.

## Validate Gateway discovery

From the host:

```bash
curl -fsS http://127.0.0.1:10000/api/onion/nodes
```

Expected properties include:

- `transport: "onion"`
- `multiHost: true`
- `selectionMode: "priority-health-fail-closed"`
- `selectedNode`: the highest-priority fresh healthy node, or `null`
- both public nodes in `nodes`

## Controlled fallback test

1. Confirm both nodes are healthy in `/api/onion/nodes`.
2. Stop or isolate only the preferred Onion endpoint. Do not delete Tor volumes or keys.
3. Wait at least one probe interval.
4. Query `/api/onion/nodes` again.
5. Confirm the preferred node is unhealthy and the secondary node is selected.
6. Restore the preferred endpoint and confirm it becomes healthy again after a subsequent probe.

The discovery service fails closed. Missing or stale health data is never treated as healthy.

## Windows deployment

In PowerShell from the clean Gateway clone:

```powershell
git pull origin main
docker compose --profile onion-discovery up -d --build onion-discovery-probe gateway
Start-Sleep -Seconds 90
docker compose --profile onion-discovery ps
Invoke-RestMethod http://127.0.0.1:10000/api/onion/nodes | ConvertTo-Json -Depth 8
```

If validating the PR before merge, check out `feat/onion-discovery-registry` instead of `main`.

## Aruba node

The Aruba VPS already hosts its own persistent Hidden Service identity. The discovery deployment does not require copying that volume to the Windows host. The probe reaches the public Aruba `.onion` through Tor like any external Tor client.

Keep the Aruba hidden-service volume persistent and backed up securely according to the existing deployment policy. Never place its private key material in GitHub or in the discovery registry.

## Rollback

The discovery sidecar is optional. To stop it without changing either Hidden Service:

```bash
docker compose --profile onion-discovery stop onion-discovery-probe
```

The Gateway will then eventually report stale/unavailable Onion health and select no node. The underlying Windows and Aruba Onion services are unaffected.
