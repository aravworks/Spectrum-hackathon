# Architecture

## Recommended architecture
Use a **modular monolith first**, with clear domain boundaries, and extract high-load services later. This is safer for a five-person team than starting with dozens of microservices.

### Logical components

```text
Consumer Web/PWA ───────┐
Collector App/PWA ──────┼──> API Gateway / Backend
Admin Web ───────────────┤             │
Research Lab ────────────┘             │
                                        ├── Auth & RBAC
                                        ├── Waste/Complaint
                                        ├── Pickup & Dispatch
                                        ├── Payments
                                        ├── Marketplace
                                        ├── Content/Awareness
                                        ├── Environmental Engine
                                        ├── GIS/Hotspot
                                        └── Analytics
                                                │
                    ┌───────────────────────────┼────────────────────┐
                    ↓                           ↓                    ↓
               PostgreSQL + PostGIS        Object Storage       Redis
                    │                           │                    │
                    └───────────────┬───────────┴───────────┬──────┘
                                    ↓                       ↓
                              Job Queue/Workers        Analytics/ML
                                    │                       │
                       Maps/GIS/Satellite APIs      Model Registry
```

## Technology baseline
- Frontend: Next.js/React + TypeScript, responsive PWA
- Backend: Python FastAPI + SQLAlchemy/Alembic
- Database: PostgreSQL + PostGIS
- Cache/queue: Redis + Celery/RQ initially
- Object storage: S3-compatible storage
- Maps: provider abstraction; Google Maps/Mapbox/OpenStreetMap-compatible implementation
- ML: Python, scikit-learn; GeoPandas/Shapely; optional PyTorch later
- Auth: OAuth/OIDC provider or self-hosted identity service
- Deployment: Docker; managed PostgreSQL; Kubernetes only when scale requires it

## Scale strategy
For national scale:
- stateless API replicas
- CDN for public content
- image processing workers
- partition large event/telemetry tables by time/region
- PostGIS indexes
- read replicas for analytics
- data warehouse/lakehouse later
- asynchronous GIS/ML pipelines
- per-city operational partitioning where needed

## Data zones
1. OLTP: operational PostgreSQL
2. Object store: photos, documents, satellite-derived artifacts
3. Analytics: warehouse/lakehouse
4. ML feature store/model artifacts: later phase

## Architectural rules
- No direct frontend access to DB.
- Every privileged action is authorized server-side.
- External providers are behind adapters.
- Payment is ledger-first; provider callbacks are not trusted as sole business state.
- Environmental estimates store methodology/version and input assumptions.
