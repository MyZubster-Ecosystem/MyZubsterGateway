# Admin dashboard

The administration dashboard is available at `/admin`. It exposes live database
aggregates, user management, payment monitoring, and bounded payment reports.

## Configuration

Set a strong server-side token before enabling the dashboard:

```bash
export ADMIN_DASHBOARD_TOKEN="replace-with-a-long-random-value"
```

The browser keeps this token in session storage and sends it as a Bearer token.
The API fails closed with `503` when the environment variable is absent.

## API

All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard/overview` | Live user, order, payment, and runtime totals |
| `GET` | `/api/admin/dashboard/users` | Paginated and filtered user list |
| `PATCH` | `/api/admin/dashboard/users/:id` | Change a user's role or status |
| `GET` | `/api/admin/dashboard/payments` | Paginated payment or transaction monitoring |
| `GET` | `/api/admin/dashboard/reports?days=30` | Aggregated payment report for 1-365 days |

Sensitive user fields are excluded from API responses. Pagination is capped at
100 records and report windows at 365 days.
