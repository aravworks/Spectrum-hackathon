# API Contract Conventions

## Response
```json
{
  "data": {},
  "meta": {
    "request_id": "..."
  },
  "error": null
}
```

## Errors
Use stable machine-readable codes:
- VALIDATION_ERROR
- UNAUTHORIZED
- FORBIDDEN
- NOT_FOUND
- DUPLICATE
- RATE_LIMITED
- EXTERNAL_PROVIDER_ERROR
- PAYMENT_RECONCILIATION_REQUIRED

## Pagination
Cursor pagination for large datasets:
`?limit=50&cursor=...`

## Idempotency
Required for:
- create pickup
- dispatch assignment
- payment/payout commands
- status transitions with side effects

## Example report
```json
{
  "category_id": "plastic",
  "estimated_weight_kg": 12.5,
  "location": {"lat": 0, "lng": 0},
  "severity": "medium",
  "description": "Mixed plastic waste near collection point",
  "media_ids": ["..."]
}
```
