# Security Vulnerability Exceptions

Security vulnerabilities may only be temporarily accepted when there is a documented
business or technical reason.

Every exception must include:

- **Vulnerability:** CVE or vulnerability identifier
- **Severity:** Critical, High, Medium, or Low
- **Owner:** Person responsible for resolving the vulnerability
- **Reason:** Why the vulnerability cannot be fixed immediately
- **Expiry:** Date when the exception must be reviewed or removed

## Exception Template

```text
Vulnerability: CVE-YYYY-NNNN
Severity: HIGH
Owner: @username
Reason: Why this vulnerability cannot be fixed immediately
Expiry: YYYY-MM-DD
```

## Rules

1. Critical and High vulnerabilities must not be permanently ignored.
2. Every exception must have a named owner.
3. Every exception must have a documented reason.
4. Every exception must have an expiry date.
5. Expired exceptions must be reviewed and either removed or renewed with updated justification.
6. Exceptions should be kept to the minimum necessary scope.
