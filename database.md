# Database Design

PostgreSQL + PostGIS is the primary operational database.

## Core tables

### users
- id UUID PK
- role_id FK
- phone/email unique
- password_hash or external_identity_id
- status
- created_at
- updated_at

### roles
- id
- name

### user_profiles
- user_id PK/FK
- display_name
- city_id
- preferred_language

### cities
- id
- name
- state/region
- country
- boundary GEOMETRY(MultiPolygon,4326)

### addresses
- id
- user_id
- address_text
- point GEOMETRY(Point,4326)
- ward_id

### waste_categories
- id
- parent_id
- code
- name
- hazardous
- recyclable
- organic

### waste_reports
- id UUID
- reporter_id
- category_id
- description
- estimated_weight_kg
- location GEOMETRY(Point,4326)
- severity
- status
- created_at
- closed_at

### report_media
- id
- report_id
- object_key
- media_type
- sha256
- metadata_json

### pickup_requests
- id
- requester_id
- category_id
- estimated_weight_kg
- scheduled_window_start/end
- location
- status

### pickup_jobs
- id
- pickup_request_id/report_id
- collector_id
- route_id
- assigned_at
- actual_weight_kg
- proof_media_id
- completed_at

### routes
- id
- collector_id
- route_date
- geometry GEOMETRY(LineString,4326)
- distance_m
- duration_s
- optimization_version

### payments_ledger
- id
- user_id
- source_type
- source_id
- estimated_amount
- final_amount
- currency
- status
- provider_reference
- created_at

### marketplace_listings
- id
- seller_id
- category_id
- quantity_kg
- asking_price
- location
- status

### marketplace_offers
- id
- listing_id
- buyer_id
- offered_price
- status

### awareness_articles
- id
- category_id
- title
- slug
- body
- emissions_summary
- disposal_guidance
- published_at
- author_id

### footprint_factors
- id
- waste_category_id
- factor_type
- factor_value
- unit
- source_reference
- methodology_version
- valid_from
- valid_to

### footprint_calculations
- id
- user_id nullable
- city_id nullable
- input_weight_kg
- category_id
- factor_id
- co2e_kg
- methane_kg
- assumptions_json
- calculated_at

### hotspots
- id
- city_id
- geometry
- score
- evidence_count
- confidence
- status
- generated_at

### satellite_observations
- id
- provider
- capture_time
- footprint
- asset_uri
- processing_version
- metadata_json

### dump_candidates
- id
- observation_id
- geometry
- confidence
- classifier_version
- human_review_status

### research_datasets
- id
- name
- description
- access_level
- query_definition
- created_at

### audit_logs
- id
- actor_id
- action
- entity_type
- entity_id
- before_json
- after_json
- created_at

## Indexing
- GiST on all geography columns
- B-tree on status, city_id, created_at
- composite indexes for operational queues
- partial indexes for open complaints/jobs
- unique hash index for media deduplication where appropriate

## Data retention
Define retention by jurisdiction and data type. Keep research datasets anonymized/aggregated unless explicit lawful access exists.
