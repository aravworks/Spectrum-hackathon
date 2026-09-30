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
- `architecture.md` — system architecture and deployment
- `workflow.md` — end-to-end business and technical workflows
- `agents.md` — five-person/agent delivery structure
- `database.md` — relational schema and data model
- `backend.md` — APIs, services, jobs, security and backend rules
- `frontend.md` — applications, screens, UX and state
- `integrations.md` — maps, GIS, satellite, payments, notifications, ML
- `ml_and_routing.md` — routing, hotspot detection and future ML
- `environmental_engine.md` — carbon/methane estimation methodology
- `research_lab.md` — research and raw-metric architecture
- `security.md` — security, privacy, abuse prevention
- `devops.md` — environments, CI/CD, observability and scaling
- `api_contract.md` — API conventions and representative endpoints
- `product_requirements.md` — functional/non-functional requirements
- `implementation_plan.md` — phased build plan
- `.env.example` — configuration template; never commit real secrets
- `docker-compose.yml` — local development dependencies
