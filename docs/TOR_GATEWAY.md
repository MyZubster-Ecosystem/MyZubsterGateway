# Optional Tor gateway transport

Tor is an optional transport for operators who need an onion-service endpoint. It
does not replace, disable, or alter the normal HTTPS listener. The deployment is
disabled unless the `tor` Compose profile is explicitly selected.

## Local deployment

1. Copy `deploy/tor/instances.example.json` to `deploy/tor/instances.json`.
2. Keep `enabled` set to `false` until each generated onion hostname has been
   placed in the operator-owned configuration.
3. Start the normal gateway first and verify its HTTPS health endpoint.
4. Run `docker compose -f docker-compose.yml -f deploy/tor/docker-compose.tor.yml
   --profile tor up -d --build`.
5. Read local-only discovery metadata from
   `http://127.0.0.1:9080/v1/tor/instances`.

The example runs two isolated Tor processes with separate persistent data
volumes. Increase or reduce the instance services as required, giving each one a
unique volume, `TOR_INSTANCE_ID`, priority, and public onion hostname. Never copy
an onion private-key directory between simultaneously running instances.

## Health and failover

Each Tor container checks that its hostname exists and that the upstream Gateway
health endpoint responds. It writes only `healthy`, `checkedAt`, and a generic
failure reason to a shared status volume. The metadata service sorts healthy
instances by numeric priority and publishes `selectedInstance`; it never reads
the Tor data volumes or private keys. Missing, malformed, and stale status inputs
fail closed as unavailable. Direct HTTPS remains independently advertised.

The metadata listener binds to loopback on the host by default. Put authentication
and TLS in front of it before exposing it outside the operator network. Consumers
must treat discovery as advisory and retain their normal HTTPS fallback.

## Rotation and recovery

1. Add a fresh Tor instance with a new data volume and lower precedence.
2. Wait for a healthy status and publish its onion hostname in configuration.
3. Move the new instance to the preferred priority and monitor both transports.
4. Remove the old hostname from discovery, then stop its container.
5. Back up or destroy its private-key volume according to the operator policy.

If a key is lost or suspected compromised, do not restore it onto another live
instance. Remove the endpoint from discovery, create a new volume and hostname,
and publish the replacement after health verification. Logs and support bundles
must exclude `/var/lib/tor`, Docker volume exports, control cookies, and client
authorization material.
