# Integrations

Use adapters so providers can be replaced.

## Maps/GIS
Required capabilities:
- geocoding/reverse geocoding
- routing
- map tiles
- distance matrix
- polygons/wards

Provider options:
- Google Maps Platform
- Mapbox
- OpenStreetMap ecosystem / self-hosted routing

Do not hard-code provider SDK calls throughout the application.

## Satellite
Possible providers:
- Sentinel-2/Copernicus-derived datasets
- Landsat
- commercial providers where licensed

Pipeline:
catalog search → download/reference asset → preprocessing → model → candidate polygons → review.

## Payments
Use a licensed payment provider appropriate to the deployment country. Support:
- payout initiation
- webhook verification
- reconciliation
- refunds/failed payouts
- ledger mapping

Never store card credentials.

## Notifications
SMS/email/push via provider abstraction.

## Identity
OIDC/OAuth2 compatible provider preferred.

## Analytics
Warehouse integration can be added after MVP.

## LLM
An LLM is optional and should not be the core truth source for:
- geospatial measurements
- payment amounts
- emissions factors
- route distances

It can help explain analytics, summarize research, answer awareness questions, and generate natural-language insights from approved datasets.
