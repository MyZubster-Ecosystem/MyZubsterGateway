# Verifiable XMR Stagenet End-to-End Settlement

Issue: #1403

## Status

**STAGENET-ONLY / IMPLEMENTATION CONTRACT**

This document defines the first MyZubster Monero settlement proof that may be called end-to-end. It does not authorize mainnet transfers, custody, exchange, escrow or production payouts.

## Non-negotiable invariant

A successful `monero-wallet-rpc` submit response is **not** settlement finality.

```text
submitter != verifier
```

`PAID` is allowed only after a separately configured verification boundary validates the required facts and the required confirmation state.

## Lifecycle

```text
PENDING
  -> RESERVED | ACCEPTED
  -> SUBMITTED
  -> CONFIRMED
  -> PAID
```

Failure/exception states include:

```text
FAILED
UNSETTLED
DISPUTED
CANCELLED
```

No transition may skip from `PENDING`, `ACCEPTED` or `SUBMITTED` directly to `PAID`.

## Settlement intent

A minimal XMR stagenet intent should be representable as:

```json
{
  "settlementId": "stable-idempotency-key",
  "asset": "XMR",
  "network": "stagenet",
  "recipient": "<stagenet address>",
  "amountAtomic": "100000000",
  "purpose": "bounty|order|test",
  "sourceRef": "issue/order/bounty reference",
  "status": "PENDING"
}
```

Rules:

- `amountAtomic` is a decimal string to avoid floating-point ambiguity;
- the configured network must equal `stagenet`;
- recipient validation must reject addresses incompatible with the configured network;
- the application-side recipient guard checks Monero base58 alphabet, address length, and stagenet address family (`5` standard/integrated, `7` subaddress); final economic verification still belongs to the independent Monero verifier;
- `settlementId` is stable across retries;
- a retry using an existing submission must match the original asset, network, recipient and atomic amount exactly;
- no wallet seed, private spend key, RPC password or other secret belongs in the intent or logs.

## Submission result

The submission adapter may produce:

```json
{
  "settlementId": "stable-idempotency-key",
  "asset": "XMR",
  "network": "stagenet",
  "txId": "<transaction id>",
  "amountAtomic": "100000000",
  "status": "SUBMITTED"
}
```

It MUST NOT produce `PAID`.

## Independent verifier contract

The verifier should accept expected facts plus the transaction reference and return observed/verified facts without any transfer/signing capability.

Conceptual request:

```json
{
  "settlementId": "stable-idempotency-key",
  "txId": "<transaction id>",
  "expected": {
    "asset": "XMR",
    "network": "stagenet",
    "recipient": "<expected recipient>",
    "amountAtomic": "100000000"
  }
}
```

Conceptual result:

```json
{
  "valid": true,
  "txId": "<transaction id>",
  "asset": "XMR",
  "network": "stagenet",
  "recipientMatch": true,
  "amountMatch": true,
  "confirmed": true,
  "confirmations": 10,
  "evidenceMethod": "documented-monero-proof-method"
}
```

The concrete Monero evidence mechanism must be documented. Because Monero is privacy-preserving, an ordinary public explorer is not assumed to reveal or independently prove destination and amount. The implementation must use an authorized reproducible method such as wallet-RPC evidence, a transaction proof, view-key-derived evidence, or another method whose trust assumptions are explicitly stated.

## Fail-closed rules

Verification must fail and settlement must remain not-paid when any of these occurs:

- verifier unavailable or timeout;
- unknown/malformed `txId`;
- wrong network;
- wrong amount;
- recipient/destination evidence mismatch;
- transaction not yet confirmed to the configured threshold;
- replay or duplicate settlement attempt;
- an idempotent retry reuses the same `settlementId` with a different recipient, amount, asset or network;
- verifier result cannot establish all required facts;
- submission succeeds but verification fails.

## Idempotency

The same `settlementId` must not create multiple economic settlements.

A retry may:

- return the already recorded transaction reference only when the economic intent is identical;
- resume verification;
- return a deterministic already-submitted/already-paid result from a higher-level persisted lifecycle.

It must not silently submit another transfer or reinterpret the same `settlementId` for a different recipient or amount.

## Evidence package

The first successful E2E run should publish only sanitized evidence:

- exact MyZubsterGateway commit SHA;
- Monero daemon/wallet RPC versions;
- network = stagenet;
- sanitized settlement intent;
- TXID;
- submission timestamp;
- verification timestamp;
- observed confirmation count/status;
- verifier method and trust assumptions;
- final state transition to `PAID`;
- test output for negative cases.

Never publish wallet seeds, private keys, RPC credentials, unnecessary wallet metadata or unrelated personal data.

## Required negative tests

1. Wrong amount -> not paid.
2. Wrong recipient/evidence target -> not paid.
3. Wrong network -> not paid.
4. Unknown TXID -> not paid.
5. Unconfirmed transaction -> not paid.
6. Verifier timeout -> not paid.
7. Duplicate `settlementId` with identical intent -> no second transfer.
8. Duplicate `settlementId` with changed recipient/amount/network -> rejected.
9. Mainnet/malformed recipient address -> rejected before submission.
10. Submit success + verifier failure -> not paid.

## Mainnet gate

Issues proposing mainnet activation (#23, #33) must remain downstream of this work. A passing stagenet E2E is necessary but not sufficient for mainnet: security, operational and applicable compliance/release gates still apply.
