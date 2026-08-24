# Metatron AI — local integration

## Purpose

Metatron is an optional local knowledge/context service for development and security workflows. It must not receive production banking credentials, private keys, payment secrets, or personal financial data.

## Local-only architecture

```text
Developer / approved local agent
          |
          v
   Metatron (localhost)
          |
          v
  MyZubster project context
```

Metatron is a context/knowledge layer, not an authorization layer, payment processor, security boundary, or production dependency.

## Safety requirements

- Run Metatron locally or on an explicitly isolated development host.
- Bind the service to localhost unless a secured private network is explicitly required.
- Never commit Metatron databases, indexes, tokens, API keys, or generated secrets.
- Do not load production banking credentials or customer financial data.
- Keep credentials in the developer's local secret store/environment, never in source control.
- Treat generated context as untrusted input: code changes still require normal tests, security checks, and human review.
- Do not allow an agent connected to Metatron to merge, deploy, or change production configuration without the existing approval controls.

## Repository integration

This repository intentionally keeps the Metatron runtime external. The integration is documentation-first so developers can run a local Metatron instance without adding an unreviewed production dependency to the gateway.

If an MCP endpoint is enabled, configure it locally in the developer/agent environment and keep the endpoint out of committed application configuration.

## Verification checklist

- [ ] Metatron runs only in the local/dev environment.
- [ ] No production secrets or financial/customer data are indexed.
- [ ] `.gitignore` excludes local Metatron state if it is created in the repository workspace.
- [ ] Agents retain human approval for code, merge, and deployment actions.
- [ ] Security scans and tests remain mandatory for changes influenced by Metatron.
