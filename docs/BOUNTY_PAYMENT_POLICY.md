# MyZubster Bounty Payment Policy

**Status: P0 / temporary settlement freeze**

## 1. Payment gate

A bounty is payable only when **both** conditions are satisfied:

1. The implementation has been technically accepted after review, including required CI/security checks.
2. The payment has a **verifiable on-chain settlement reference**.

A bounty must never be marked `PAID` based only on an internal status, screenshot, wallet balance, or contributor claim.

## 2. Settlement states

- `PENDING` — work and/or payment has not completed the acceptance gate.
- `ACCEPTED` — implementation accepted, payment not yet independently verified.
- `PAID` — payment independently verified and linked to a transaction reference.
- `UNSETTLED` — payment was previously reported as paid or expected, but cannot currently be independently verified.
- `DISPUTED` — contributor and project records disagree and reconciliation is required.

## 3. Required payment record

Every payment marked `PAID` must record:

- bounty/issue number
- contributor GitHub handle
- reward amount and asset
- network
- sender/payment wallet identifier where appropriate
- transaction hash or canonical transaction identifier
- explorer reference when available
- settlement timestamp
- reviewer/approver

Do not publish private keys, wallet seeds, passwords, or other secrets.

## 4. Temporary freeze

Until the P0 settlement reconciliation is complete, **new bounty payments are frozen**. New contributions may still be submitted and reviewed, but no payout is considered due until the implementation acceptance and settlement-verification gates are both satisfied.

## 5. Historical reconciliation

Historical records must be reconciled independently. If a historical payment cannot be verified on the actual network used, classify it as `UNSETTLED` rather than `PAID` until evidence is recovered.

The reconciliation work is tracked in:

- `P0 — Bounty settlement audit and verifiable MYZ payment reconciliation` (#1336)

## 6. Contributor communication

When a bounty is under review, communicate the status explicitly. Do not promise a payout date before technical acceptance and payment verification are complete.

## 7. Reopening payouts

The payment freeze can be lifted only after the reconciliation issue meets its exit criteria: a contributor can independently verify the payment status and transaction reference for every settlement marked `PAID`.
