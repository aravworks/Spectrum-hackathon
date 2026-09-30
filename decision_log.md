# Architecture Decision Log

## ADR-001: Modular monolith first
Reason: five-person team; faster iteration; lower operational complexity.
Future: extract dispatch, GIS/ML and analytics when justified by load/team ownership.

## ADR-002: PostgreSQL + PostGIS
Reason: transactional consistency plus mature geospatial operations.

## ADR-003: Ledger-first payments
Reason: collection weight and verification must be auditable.

## ADR-004: Satellite detection is assistive
Reason: imagery has resolution/cloud/coverage/model limitations. Candidate detections require verification.

## ADR-005: Environmental estimates are versioned
Reason: factors and methodologies vary. Reproducibility requires source/version/assumptions.
