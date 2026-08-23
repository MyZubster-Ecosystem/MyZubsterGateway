# Bounty Wording Audit — Issue #1380

- **Tracking issue:** [MyZubster-Ecosystem/MyZubsterGateway#1380](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/1380)
- **Status:** IN PROGRESS
- **Scope:** legacy bounty wording that can be read as "merge/closure = payment", in repository files and historical bounty issues.

## Objective

Audit historical bounty issues and repository content whose wording implies automatic payment on PR merge or issue closure, and align them with the canonical bounty/settlement model.

A merge or closed issue alone must **never** be treated as proof of funding or payment.

## Canonical interpretation

```
issue/claim
→ implementation
→ review
→ VERIFIED / REJECTED
→ REWARD_RECORDED (if applicable)
→ SETTLEMENT_PENDING / SETTLED (only if applicable and independently evidenced)
```

## Remediation applied to this repository (2026-08-23)

| File | Legacy wording | Remediation |
|------|----------------|-------------|
| `.github/ISSUE_TEMPLATE/bounty.yml` | "Pagamento via gateway dopo il merge" | Replaced with canonical flow disclaimer; added required fields: rail, funding state, verification, settlement conditions; linked `BOUNTIES.md` + `REWARDS_LEDGER.md` |
| `.github/ISSUE_TEMPLATE/free.yml` | "Pagamento dopo il merge della PR" | Replaced with `REWARD_RECORDED` / independent-evidence settlement wording; policy links added |
| `.github/ISSUE_TEMPLATE/bounty-guide.md` | Payment promised after merge within 48h; curl auto-payment trigger example | Rewritten as verification-gated settlement model incl. current P0 payout freeze; trigger example removed |
| `dist/bounty.html` | "Ricevi il pagamento ... automaticamente dopo il merge" | Reworded: reward recorded after verified review; settlement requires independent evidence |

Identical changes were mirrored in the nested duplicate copy under `MyZubsterGateway/`.

`.github/ISSUE_TEMPLATE/bounty.md`, `BOUNTIES.md`, `docs/BOUNTY_PAYMENT_POLICY.md` were already compliant and unchanged.

## Historical issues audit queue

> This is an audit queue, not a claim that every item has the same settlement state.
> Amounts shown on these issues are **historical/proposed** unless funding evidence exists.

| Issue | Title (short) | Wording audit | Funding evidence |
|-------|---------------|---------------|------------------|
| [#255](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/255) | BOUNTY B2 — Robot Dashboard Frontend | pending review | not verified |
| [#257](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/257) | BOUNTY B4 — Wallet reale per Tari (MYZ) | pending review | not verified |
| [#259](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/259) | BOUNTY B6 — Sistema di notifiche reali | pending review | not verified |
| [#261](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/261) | BOUNTY B8 — Test automatizzati (Jest) | pending review | not verified |
| [#268](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/268) | BOUNTY P4 — Logging | pending review | not verified |
| [#271](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/271) | BOUNTY P7 — Pagina di stato del gateway | pending review | not verified |
| [#274](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/274) | BOUNTY P10 — Docker Compose per sviluppo | pending review | not verified |
| [#276–#284](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues?q=is%3Aissue%20B11%20OR%20B19) | BOUNTY B11–B19 (WebSocket, ruoli e permessi, ecc.) | pending review | not verified |
| [#338](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/338) | BOUNTY BOT-1 — Dashboard robot realtime | pending review | not verified |
| [#339](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/339) | BOUNTY BOT-2 — Code review automatica robot | pending review | not verified |
| [#344](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/344) | BOUNTY BOT-7 — Template scaffolding robot | pending review | not verified |
| [#345](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/345) | BOUNTY BOT-8 — Hardware bridge robot fisici | pending review | not verified |
| [#347](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/347) | BOUNTY BOT-10 — Robot marketplace | pending review | not verified |
| [#358](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/358) | SG-1 — Framework normativo tokenizzazione | pending review | not verified |
| [#360–#367](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues?q=is%3Aissue%20SG-) | SG-3–SG-10 (Deeming Provisions, Compliance Toolkit, ecc.) | pending review | not verified |
| [#371–#377](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues?q=is%3Aissue%20SG-4%20OR%20SG-10) | SG-4–SG-10 (AML/CFT, API docs, ecc.) | pending review | not verified |
| [#389](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues/389) | Bounty Program 1.070 MYZ announcement | pending review | not verified |

### Queue rules

- Review open bounty issues first, then closed historical issues.
- Preserve historical reward amounts but label them as **historical/proposed** where current funding evidence is absent.
- Do **not** mark any item `PAID` without independently verifiable settlement evidence (tx hash / explorer reference).
- Items that cannot be verified are classified `UNSETTLED` per `docs/BOUNTY_PAYMENT_POLICY.md`.
- Corrective comments should link this report, `BOUNTIES.md` and the canonical `REWARDS_LEDGER.md`.

## References

- Local rules: [`BOUNTIES.md`](../../BOUNTIES.md)
- Local payment policy: [`docs/BOUNTY_PAYMENT_POLICY.md`](../BOUNTY_PAYMENT_POLICY.md)
- Canonical rules: <https://github.com/MyZubster-Ecosystem/myzubster/blob/main/BOUNTIES.md>
- Canonical ledger: <https://github.com/MyZubster-Ecosystem/myzubster/blob/main/REWARDS_LEDGER.md>
