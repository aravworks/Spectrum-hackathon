# Security, Privacy and Abuse Prevention

## Threats
- fake reports
- duplicate reports
- reward fraud
- account takeover
- malicious uploads
- location privacy leakage
- marketplace scams
- admin privilege abuse
- payment webhook spoofing
- API scraping
- denial of service

## Controls
- MFA for admins
- RBAC and object-level authorization
- rate limits
- CAPTCHA/step-up verification where needed
- media type/size validation
- malware scanning
- signed URLs
- encrypted transport
- encryption at rest where supported
- secrets manager
- immutable/auditable admin actions
- webhook signature verification
- idempotency
- anomaly detection

## Privacy
Collect only what is required.
Exact home location should not be exposed publicly.
Public maps should aggregate or blur sensitive points where appropriate.
Research exports should be anonymized/aggregated.

## Payment safety
Maintain internal ledger. Reconcile provider events. Never trust client-provided amount.
