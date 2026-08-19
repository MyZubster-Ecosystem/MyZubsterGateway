# Jurisdiction capability registry

The Gateway resolves legal jurisdiction independently from language or locale. Business routes
must ask the capability service for a decision and must not add country-specific allow lists.

## API

- `GET /api/jurisdictions/:countryCode/capabilities?subdivision=US-CA` returns the effective
  country and subdivision profile.
- `POST /api/jurisdictions/decision` evaluates one capability. The request accepts
  `countryCode`, optional `subdivisionCode`, `capability`, and `environment`.

Only `SUPPORTED` is allowed in production. `PILOT_ONLY` is allowed in `pilot`, `sandbox`, or
`test`. `RESTRICTED`, `BLOCKED`, and `REVIEW_REQUIRED` deny execution. Missing regulated
capabilities always use the global `BLOCKED` default.

Every decision includes the schema version, policy version, resolved jurisdiction, evidence,
approval reference, and allow/deny reason. The default router writes this audit record as
structured JSON; production deployments should send it to the normal audit sink.

## Add a jurisdiction

1. Add the ISO 3166-1 alpha-2 key under `jurisdictions` in
   `data/jurisdictions/v1.json`.
2. Add subdivisions as ISO 3166-2 keys only when regional policy differs.
3. Give every configured capability a valid `state`, an `evidence` array, and an approval
   reference when the state is `SUPPORTED`.
4. Never mark a regulated capability supported from locale, IP address, or self-declared
   country alone. The caller remains responsible for trusted jurisdiction resolution.
5. Add regression tests for the profile and run
   `node --test tests/jurisdiction*.test.js`.
6. Increment `policyVersion` for policy-only changes. Create a new schema file and update the
   loader deliberately for incompatible structural changes.

Adding a profile requires no changes to normal business routes.
