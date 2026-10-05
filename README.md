# MyZubster Gateway

<p align="center">
  <img src="assets/readme/myzubster-gateway.png" alt="MyZubster Gateway architecture" width="100%">
</p>

> 🌍 **Understand MyZubster in your language:** [Global multilingual guide](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/docs/i18n/README.md) — English, Italiano, Español, Français, Deutsch, Português, 中文, 日本語, 한국어, العربية, हिन्दी, Русский, Türkçe, Bahasa Indonesia, Polski, Українська, বাংলা, اردو, فارسی, Kiswahili.
>
> MyZubster connects real-world observations, verifiable evidence, collaborative bounties and platform rewards. **MYZ is currently an internal reward/accounting ledger; external XMR/token/blockchain settlement is separate and independently verified.**

Backend integration boundary for the MyZubster ecosystem, including API, order, webhook, registry and payment/settlement-related components.

## Project status

**MVP / active validation.** The repository contains working backend components and automated tests. Payment, settlement and external-provider integrations are environment-dependent until the corresponding integration and independent-verification checks are green.

The Gateway is not the canonical authority for declaring an external payment final.

## Ecosystem role

```text
MyZubster core
      |
      v
Gateway / adapters
      |
      v
payment/treasury provider
      |
      v
independent verifier
      |
      v
CONFIRMED / PAID
```

See:

- [Ecosystem Architecture](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/docs/ECOSYSTEM.md)
- [Canonical Bounty System](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/BOUNTIES.md)
- [`BOUNTIES.md`](BOUNTIES.md) for Gateway-specific bounty scope.

## Stack

- Node.js 20+
- Express
- MongoDB / Mongoose
- wallet/provider integrations where configured
- JWT authentication
- security headers/CORS/rate limiting
- automated tests

## Quick start

```bash
git clone https://github.com/MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway
npm ci
```

Create `.env` from the repository template and configure only environment-specific values. Never commit production credentials.

Start using the current package scripts, typically:

```bash
npm start
```

## Tests

```bash
npm test
```

Payment/settlement work should test negative paths including provider failure, timeout, duplicate/replay, wrong recipient, wrong amount/network and unavailable verification.

## Settlement contract

Settlement is deliberately separate from normal application flow.

A safe external lifecycle is:

```text
PENDING -> RESERVED/ACCEPTED -> SUBMITTED -> CONFIRMED -> PAID
```

Additional states may include `FAILED`, `UNSETTLED`, `DISPUTED` and `CANCELLED`.

Important rules:

- an application/database update is not chain/payment proof;
- a provider/adapter response alone cannot mark `PAID`;
- transaction id/hash, recipient, asset, network and canonical amount must match expected settlement data;
- unavailable verification must fail closed rather than infer success;
- MYZ in the current core platform is an internal reward/accounting ledger, not automatically an on-chain transaction.

## API surface

Main areas may include:

| Area | Examples |
|---|---|
| Health | `/api/health` |
| Authentication | `/api/auth/*` |
| Users | `/api/users/*` |
| Orders | `/api/orders/*` |
| Payments | `/api/payments/*` |
| Webhooks | `/api/webhooks/*` |
| Registries | animal/plant or related integration routes |

Verify the current router/controller source before building an external integration against a historical endpoint list.

## Security / production checklist

Before production deployment verify:

- dependency/security checks;
- secrets from deployment environment, not Git;
- HTTPS/TLS and network restrictions;
- JWT/key rotation;
- authentication/authorization and rate limiting;
- database backup/rollback;
- provider/RPC authentication/network controls;
- idempotency and duplicate prevention;
- observable retry/failure behavior;
- independent settlement verification;
- health checks and monitoring.

**Never commit private keys, wallet seeds, passwords or production credentials.**

## Bounties

Gateway work can be bountied for API, security, integration, reconciliation, testing and documentation tasks. Issue/PR/merge does not prove external payment. Follow the canonical bounty and settlement contracts linked above.

## Contributor network

The Gateway is part of the wider MyZubster contributor and Knowledge workflow. Public contributor links are kept evidence-first and do not imply payment, professional certification or production settlement.

| Contributor | Public evidence | Linked competence / role | Status |
|---|---|---|---|
| **Nicola / N4K48** | [Independent pilot](https://github.com/nicolaususnicola-lgtm/myzubster-mvp) · [MyZubster pilot documentation](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/docs/learning/NICOLA-INDEPENDENT-LOCAL-NODE-PILOT.md) | Independent local node, Docker, Node Bridge, reproducible testing | **Pilot reference · evidence-rich** |
| **khongten124** | [PR #1451](https://github.com/MyZubster-Ecosystem/myzubster/pull/1451) · [public contributor profile](https://github.com/khongten124/myzubster/blob/feat/open-period-care-research-1450/docs/contributions/khongten124-medical-research-profile.md) | Research documentation, evidence organization, technical/data analysis | **APPROVED_BY_CONTRIBUTOR + EVIDENCE_VERIFIED** |
| **hoicailon94** | [Issue #1463](https://github.com/MyZubster-Ecosystem/myzubster/issues/1463) · [workflow #1474](https://github.com/MyZubster-Ecosystem/myzubster/issues/1474) | Revenue split, deterministic allocation, reconciliation architecture | **IN VERIFICATION** |

Canonical contributor status and Knowledge/Passport links live in the [main MyZubster repository](https://github.com/MyZubster-Ecosystem/myzubster).

### Contributor interoperability / controlled VPS bridge

Independent contributor projects may optionally connect to MyZubster through a controlled Gateway/VPS interoperability pilot:

```text
CONTRIBUTOR PROJECT / LOCAL NODE / API
        ↓
PUBLIC GITHUB EVIDENCE
        ↓
MYZUBSTER PROFILE / KNOWLEDGE / PASSPORT
        ↓
CONTROLLED GATEWAY / VPS BRIDGE
        ↓
HARMLESS READ-ONLY TEST
        ↓
SANITIZED VERIFICATION EVIDENCE
```

This is **not shared server administration**. Participation does not provide SSH access, root access or unrestricted credentials. Private endpoints, access tokens, JWT secrets, SSH keys, wallet seeds, private keys and passwords must never be committed or posted publicly.

The first test should be minimal, reversible and read-only where possible. Passing a connectivity test proves only that the tested bridge path worked; it does not prove production readiness, payout, settlement, wallet ownership, certification or partnership.

Contributors can propose a bridge pilot through [MyZubster contributor workflow #1474](https://github.com/MyZubster-Ecosystem/myzubster/issues/1474) with their repo/branch, component, environment, public evidence and a harmless first-test proposal.

## Contributing

Create a feature branch, add/update tests, run the relevant checks and open a PR linked to the issue.

## License

MIT License. See [LICENSE](./LICENSE).
