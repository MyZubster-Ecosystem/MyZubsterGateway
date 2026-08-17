# MyZubster Gateway

Backend API for the MyZubster ecosystem, including payment, order, webhook and registry integrations.

## Project status

**MVP / active validation.** The repository contains working backend components and automated tests. Payment, settlement and external-provider integrations should be treated as environment-dependent until the corresponding integration checks are green.

## Stack

- Node.js 20
- Express
- MongoDB / Mongoose
- Monero RPC integration
- JWT authentication
- Helmet, CORS and rate limiting
- Node.js test runner

## Quick start

### Prerequisites

- Node.js 20+
- MongoDB 6+
- Monero node (local or remote, when payment integration is enabled)

### Install

```bash
git clone https://github.com/MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway
npm ci
```

Create `.env` from `.env.example` and configure only environment-specific values.

Start the service:

```bash
npm start
```

## Test

Run the gateway test suite locally:

```bash
npm test
```

CI runs `npm ci`, the complete test suite and a dependency audit on Node.js 20.

## Settlement

Settlement is intentionally separated from the normal application flow and uses an auditable state machine. The current test suite covers:

- verified payment reaching `PAID`;
- unverified transactions remaining `UNSETTLED`;
- simulation payments being rejected as real settlements;
- duplicate bounty creation being idempotent;
- prevention of `PAID` without a transaction id;
- historical reconciliation requiring verified evidence and a matching network.

Before production use, add provider-specific integration tests for timeout, retry, duplicate submission and provider failure scenarios.

## Security / production checklist

Before production deployment, verify:

- dependency audit is clean at the required severity threshold;
- secrets are supplied through the deployment environment;
- HTTPS/TLS is enabled;
- JWT secrets are rotated and never committed;
- rate limiting and security headers are active;
- MongoDB backups and rollback procedures are tested;
- Monero RPC endpoints require appropriate authentication/network controls;
- settlement provider failures and retries are observable;
- health checks and monitoring are connected to the deployment platform.

**Never commit private keys, wallet seeds, passwords or production credentials.**

## API surface

The main API areas include:

| Area | Examples |
|---|---|
| Health | `/api/health` |
| Authentication | `/api/auth/*` |
| Users | `/api/users/*` |
| Orders | `/api/orders/*` |
| Payments | `/api/payments/*` |
| Webhooks | `/api/webhooks/*` |
| Animals | `/api/animals/*` |
| Plants | `/api/plants/*` |

API details should be verified against the deployed environment before external integrations are built.

## Contributing

Create a feature branch, add or update tests, run `npm test`, and open a pull request.

## License

MIT License. See [LICENSE](./LICENSE).
