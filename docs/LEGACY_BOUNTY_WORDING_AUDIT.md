# Legacy bounty wording audit

Snapshot date: 2026-08-23

This audit covers the historical Gateway bounty issues named in #1380. It
does not assert that any reward was funded, recorded, settled, or paid.
Historical amounts are retained only as the amounts originally advertised.

## Result

- 38 issues inspected through the GitHub API.
- 36 closed issues still say that payment follows a merge.
- #257 and #389 already contain settlement clarification.
- No issue in this audit may be treated as `PAID` without independently
  verifiable settlement evidence.

The canonical rules are the ecosystem
[BOUNTIES.md](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/BOUNTIES.md)
and
[rewards ledger](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/REWARDS_LEDGER.md).
An issue, PR, merge, closure, gateway response, screenshot, simulated
transaction, or internal ledger entry is not external payment proof.

## Issue inventory

`Legacy wording` means that the issue still includes the statement
"Pagamento: via gateway dopo il merge" or an equivalent automatic-payment
implication. Amounts below are historical advertisements, not debts or proof
of funding.

| Issue | State | Historical amount | Audit status |
| --- | --- | ---: | --- |
| #255 | closed | 100 MYZ | Legacy wording |
| #257 | closed | 150 MYZ | Clarification present |
| #259 | closed | 100 MYZ | Legacy wording |
| #261 | closed | 120 MYZ | Legacy wording |
| #268 | closed | 40 MYZ + 10 points | Legacy wording |
| #271 | closed | 35 MYZ + 10 points | Legacy wording |
| #274 | closed | 50 MYZ + 10 points | Legacy wording |
| #276 | closed | 100 MYZ | Legacy wording |
| #277 | closed | 120 MYZ | Legacy wording |
| #278 | closed | 150 MYZ | Legacy wording |
| #279 | closed | 80 MYZ | Legacy wording |
| #280 | closed | 100 MYZ | Legacy wording |
| #281 | closed | 120 MYZ | Legacy wording |
| #282 | closed | 150 MYZ | Legacy wording |
| #283 | closed | 100 MYZ | Legacy wording |
| #284 | closed | 120 MYZ | Legacy wording |
| #338 | closed | 120 MYZ | Legacy wording |
| #339 | closed | 150 MYZ | Legacy wording |
| #344 | closed | 60 MYZ | Legacy wording |
| #345 | closed | 150 MYZ | Legacy wording |
| #347 | closed | 180 MYZ | Legacy wording |
| #358 | closed | 150 MYZ | Legacy wording |
| #360 | closed | 200 MYZ | Legacy wording |
| #361 | closed | 120 MYZ | Legacy wording |
| #362 | closed | 160 MYZ | Legacy wording |
| #363 | closed | 100 MYZ | Legacy wording |
| #364 | closed | 170 MYZ | Legacy wording |
| #365 | closed | 140 MYZ | Legacy wording |
| #366 | closed | 190 MYZ | Legacy wording |
| #367 | closed | 130 MYZ | Legacy wording |
| #371 | closed | 140 MYZ | Legacy wording |
| #372 | closed | 160 MYZ | Legacy wording |
| #373 | closed | 130 MYZ | Legacy wording |
| #374 | closed | 110 MYZ | Legacy wording |
| #375 | closed | 150 MYZ | Legacy wording |
| #376 | closed | 80 MYZ | Legacy wording |
| #377 | closed | 100 MYZ | Legacy wording |
| #389 | closed | 1,070 MYZ program total | Clarification present |

## Recommended issue-body clarification

Append this block to each issue marked `Legacy wording`; retain the original
text as historical context rather than silently rewriting the advertised
amount:

> **Settlement clarification:** The amount above is the reward originally
> advertised. Issue closure or PR merge does not prove that the reward was
> funded, recorded, externally settled, or paid. Use the canonical bounty
> policy and rewards ledger to determine the current funding and reward-record
> state. Mark `PAID` only when independently verifiable settlement evidence is
> linked.

Apply the clarification to open issues before closed issues if more legacy
issues are discovered. Maintainers must perform issue-body edits because a PR
cannot update historical GitHub issue bodies.

## Reproduction

Run the audit from the repository root:

```sh
node scripts/audit-legacy-bounty-wording.mjs
```

Set `GITHUB_TOKEN` to avoid the unauthenticated API rate limit. The command
prints one result per issue and exits non-zero if an issue cannot be inspected.
