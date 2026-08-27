# Jurisdiction gate configuration

The Gateway jurisdiction gate is fail-closed. Restricted wallet and settlement routes only evaluate a jurisdiction obtained from trusted server-side state.

Trusted sources, in precedence order:

1. `req.verifiedJurisdiction`, set by authenticated or otherwise verified server middleware.
2. `MYZUBSTER_JURISDICTION`, set in the server environment.

Client-controlled `x-jurisdiction` headers and `jurisdiction` fields in request bodies or query strings are non-authoritative and are ignored for enforcement.

If neither trusted source is present, or if the trusted value is unknown, protected capabilities are denied. `CN_MAINLAND` remains denied for wallet transfer, exchange-like flows, external settlement, and provider crypto capabilities. Any regulatory exception requires separate legal/compliance approval and must not be implemented by weakening this gate.
