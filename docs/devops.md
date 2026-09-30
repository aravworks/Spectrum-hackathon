# DevOps and Operations

## Environments
- local
- development
- staging
- production

## Local
Docker Compose:
- postgres/postgis
- redis
- API
- worker
- frontend
- optional object-store emulator

## CI
On every pull request:
- lint
- type check
- unit tests
- API tests
- migration validation
- dependency/security scan
- frontend build

On staging:
- integration tests
- E2E tests
- smoke tests

## Observability
- structured JSON logs
- metrics
- traces
- error tracking
- audit logs

Key metrics:
- API latency
- error rate
- queue lag
- route optimization duration
- pickup completion
- payment failures
- storage failures
- model inference latency

## Backups
- automated DB backups
- point-in-time recovery if available
- object-store versioning
- restore drills

## Scaling
Start simple. Scale:
API → workers → DB read replicas → partitioning → warehouse/lakehouse.
