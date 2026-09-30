# Backend

## Service modules
- auth
- users
- cities/wards
- waste taxonomy
- reports
- pickups
- dispatch
- routes
- payments
- marketplace
- awareness/content
- environmental calculations
- GIS/hotspots
- research
- notifications
- audit

## API style
REST/JSON initially. Version APIs under `/api/v1`.

Representative endpoints:
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/reports`
- GET `/api/v1/reports/{id}`
- GET `/api/v1/reports`
- POST `/api/v1/pickups`
- GET `/api/v1/pickups/{id}`
- POST `/api/v1/admin/dispatch/optimize`
- GET `/api/v1/admin/dashboard`
- GET `/api/v1/hotspots`
- GET `/api/v1/awareness/categories/{slug}`
- POST `/api/v1/marketplace/listings`
- POST `/api/v1/marketplace/listings/{id}/offers`
- POST `/api/v1/footprint/calculate`
- GET `/api/v1/me/footprint`
- GET `/api/v1/research/datasets`

## Background jobs
- image processing
- duplicate detection
- geocoding
- route optimization
- hotspot aggregation
- satellite processing
- notifications
- payment reconciliation
- analytics ETL

## Security
- JWT/OIDC access tokens
- short-lived access token
- refresh token rotation
- RBAC + object-level authorization
- request validation
- rate limiting
- upload scanning
- signed object URLs
- audit logs
- secrets outside source code

## Payment invariant
A user-visible amount is not final until actual collection weight and verification pass the settlement rules.

## Idempotency
POST operations affecting money or collection state require an `Idempotency-Key`.
