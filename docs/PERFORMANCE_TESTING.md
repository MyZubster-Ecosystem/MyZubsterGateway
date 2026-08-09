# MyZubster Gateway — Performance Testing

## Overview
Performance testing suite for MyZubster Gateway using k6.io.
Bounty #1104 — 500 MYZ + 1% lifetime.

## Test Profiles

| Profile | VUs | Duration | Threshold |
|---------|-----|----------|-----------|
| Smoke   | 1   | 10s      | p95 < 200ms |
| Load    | 10  | 30s      | p95 < 500ms |
| Stress  | 50  | 30s      | p95 < 1000ms |
| Soak    | 20  | 60s      | p95 < 800ms |

## Running Locally

```bash
# Install k6
# macOS: brew install k6
# Linux: sudo apt-get install k6
# Windows: choco install k6

# Smoke test
k6 run scripts/k6-load-test.js --env TEST_PROFILE=smoke

# Load test
k6 run scripts/k6-load-test.js --env TEST_PROFILE=load

# Stress test (against staging)
k6 run scripts/k6-load-test.js --env TEST_PROFILE=stress --env BASE_URL=https://staging.example.com

# Generate HTML report
k6 run scripts/k6-load-test.js --out json=results.json
```

## CI/CD Integration
Automated performance tests run on:
- Every push/PR touching server code (smoke + load)
- Daily at 08:00 UTC (stress test)
- Manual trigger via workflow_dispatch

## Custom Metrics
- `api_latency` — Per-endpoint response time trend
- `errors` — Error rate across all requests
- `benchmark_score` — Aggregate latency distribution
- `requests_total` — Total request counter

## Baseline Benchmarks
Record after first run and track over time:

| Endpoint | Avg | P95 | P99 | Max |
|----------|-----|-----|-----|-----|
| Health Check | TBD | TBD | TBD | TBD |
| Status | TBD | TBD | TBD | TBD |
| Token Balance | TBD | TBD | TBD | TBD |
| Market Stats | TBD | TBD | TBD | TBD |
| Payment Methods | TBD | TBD | TBD | TBD |
