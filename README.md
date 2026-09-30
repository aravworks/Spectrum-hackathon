# National Waste Management Platform — Project Documentation

## 1. Purpose
A software-first waste management platform designed to support a national-scale deployment in a country generating roughly 185,000 tonnes of waste/day (project assumption supplied by the product brief).

The platform connects consumers, collectors, recyclers/bulk buyers, city administrators, researchers and environmental analysts.

## 2. Core principle
**Report → Verify → Schedule → Collect → Pay → Measure → Learn → Prevent**

A consumer reports a waste issue or requests pickup with an approximate weight. The platform schedules collection, records actual collection/verification, calculates the consumer's earned payment according to configurable rules, and feeds anonymized/aggregated data into operational analytics and environmental research.

## 3. Important scope rule
The first release must NOT claim that satellite imagery or ML can reliably identify every dump. Those capabilities are probabilistic and data-dependent. MVP uses:
- GPS/geocoded reports
- manually verified dump locations
- road-network routing
- historical complaint density
- optional satellite imagery layers
- optional computer-vision models in later phases

Environmental and carbon figures are **estimates**, not direct measurements, unless supplied by validated sensors or authoritative datasets.

## 4. Documentation map
All design documents live in `docs/`:
- `docs/architecture.md` — system architecture and deployment
- `docs/workflow.md` — end-to-end business and technical workflows
- `docs/agents.md` — five-person/agent delivery structure
- `docs/database.md` — relational schema and data model
- `docs/backend.md` — APIs, services, jobs, security and backend rules
- `docs/frontend.md` — applications, screens, UX and state
- `docs/integrations.md` — maps, GIS, satellite, payments, notifications, ML
- `docs/ml_and_routing.md` — routing, hotspot detection and future ML
- `docs/environmental_engine.md` — carbon/methane estimation methodology
- `docs/research_lab.md` — research and raw-metric architecture
- `docs/security.md` — security, privacy, abuse prevention
- `docs/devops.md` — environments, CI/CD, observability and scaling
- `docs/api_contract.md` — API conventions and representative endpoints
- `docs/product_requirements.md` — functional/non-functional requirements
- `docs/implementation_plan.md` — phased build plan

## 5. Source code
- `ml/routing/` — route optimization engine (nearest-neighbor, 2-opt, OR-Tools VRP)
- `ml/hotspot/` — hotspot detection (placeholder)
- `ml/satellite/` — satellite candidate detection (placeholder)
- `backend/` — FastAPI backend (in progress)

## 6. Configuration
- `.env.example` — configuration template; never commit real secrets
- `docker-compose.yml` — local development dependencies
- `pyproject.toml` — Python project configuration
