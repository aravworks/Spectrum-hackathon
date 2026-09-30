# Five-Agent Team Structure

The “agents” can be five people, five AI coding agents, or five workstreams. Each owns a bounded area and follows shared contracts.

## Agent 1 — Product & Architecture Lead
Owns:
- PRD
- architecture
- domain boundaries
- API contracts
- acceptance criteria
- release decisions
- technical debt register

Must not independently change DB/API contracts without updating docs.

## Agent 2 — Backend & Data Engineer
Owns:
- FastAPI services
- auth/RBAC
- PostgreSQL/PostGIS
- migrations
- payments/ledger
- queues
- audit logs
- API tests

## Agent 3 — Frontend & UX Engineer
Owns:
- consumer PWA
- collector experience
- admin dashboard
- research lab UI
- accessibility
- responsive design
- frontend tests

## Agent 4 — GIS/ML/Environmental Engineer
Owns:
- routing
- hotspot detection
- geospatial processing
- satellite pipeline
- footprint calculations
- methane/carbon simulation
- model evaluation and data quality

## Agent 5 — DevOps/QA/Security/Integrations Engineer
Owns:
- Docker/CI/CD
- environments
- monitoring
- backups
- security tests
- external integrations
- end-to-end tests
- performance/load tests

## Coordination
Every feature must have:
1. requirement
2. API contract
3. DB impact
4. UI flow
5. test cases
6. observability
7. rollback plan

## Branching
- main: production
- develop: integration
- feature/<ticket-id>-<name>
- hotfix/<ticket-id>-<name>

Use pull requests and required CI checks.
