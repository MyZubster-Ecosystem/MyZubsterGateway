# Bounties — MyZubster Gateway

This repository follows the canonical [MyZubster Bounty System](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/BOUNTIES.md).

## Eligible scope

Gateway bounties may cover:

- API and integration work;
- authentication/authorization and security hardening;
- payment/settlement state machines;
- treasury/provider integration tests;
- independent-verification integration;
- idempotency, retry and reconciliation;
- observability, documentation and CI.

## Required evidence

A bounty issue must define acceptance criteria and normally requires tests plus reproducible verification. Payment-related work must demonstrate failure paths as well as success paths.

## Settlement rule

A Gateway/provider response is not proof of external payment. `PAID` requires the applicable independently verifiable settlement evidence.

MYZ in the current core platform is an internal reward/accounting ledger and must not be represented as an on-chain transaction without chain evidence.

## Security

Never commit wallet seeds, private keys, RPC passwords or production credentials. Use testnet/mocks for payment development unless a separately approved integration test explicitly requires otherwise.

## Issues

Use this repository's GitHub issues for Gateway-specific work and link the PR to the bounty issue.
