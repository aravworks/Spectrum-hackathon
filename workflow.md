# End-to-End Workflow

This document describes every major workflow in the platform, including happy paths, exception handling, rollback steps, and cross-references to related specifications.

> Related docs: [backend.md](backend.md) · [database.md](database.md) · [api_contract.md](api_contract.md) · [security.md](security.md) · [ml_and_routing.md](ml_and_routing.md) · [environmental_engine.md](environmental_engine.md)

---

## Complaint State Machine

All waste reports and pickup requests follow this lifecycle. Every transition is recorded in `audit_logs`.

```
SUBMITTED ──→ VERIFIED ──→ ASSIGNED ──→ SCHEDULED ──→ COLLECTED ──→ VERIFIED_RESOLUTION ──→ CLOSED
    │              │            │            │              │
    ├→ REJECTED    ├→ REJECTED  ├→ ESCALATED ├→ CANCELLED   ├→ ESCALATED
    ├→ DUPLICATE   │            └→ CANCELLED └→ ESCALATED   │
    └→ CANCELLED   └→ ESCALATED                             └→ VERIFICATION_FAILED ──→ ESCALATED
```

### Transition Rules
| From | To | Trigger | Authorization |
|------|----|---------|---------------|
| SUBMITTED | VERIFIED | Admin review or automated checks pass | Admin / System |
| SUBMITTED | REJECTED | Fails validation, abuse, or content policy | Admin / System |
| SUBMITTED | DUPLICATE | Spatial/temporal similarity match detected | System (admin override) |
| VERIFIED | ASSIGNED | Collector assigned by dispatch | Admin / Dispatch system |
| ASSIGNED | SCHEDULED | Route optimizer places job in route | System |
| SCHEDULED | COLLECTED | Collector records actual weight + proof | Collector |
| COLLECTED | VERIFIED_RESOLUTION | Admin/automated verification of proof + weight | Admin / System |
| VERIFIED_RESOLUTION | CLOSED | Payment settled successfully | System |
| Any open state | CANCELLED | Consumer cancels or admin force-closes | Consumer / Admin |
| Any open state | ESCALATED | SLA breach, repeated failure, or manual escalation | Admin / System |

---

## A. Consumer Waste Report

The primary flow: a consumer reports a waste issue and is eventually paid for verified collection.

```
┌─────────────┐
│ Register /  │
│   Login     │
└──────┬──────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Create Report                                    │
│  • GPS or manual location                        │
│  • Waste category / subcategory                  │
│  • Approximate weight (kg)                       │
│  • Severity (low / medium / high / critical)     │
│  • Description                                   │
│  • Photo / video evidence (upload to S3)         │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Server-Side Validation                           │
│  • Schema validation (Pydantic)                  │
│  • File type/size check + malware scan           │
│  • Rate limit check (per-user, per-IP)           │
│  • Abuse/spam detection                          │
│  • Geofence check (is location serviceable?)     │
└──────┬──────────────────┬───────────────────────┘
       ↓ pass             ↓ fail
┌──────────────┐   ┌─────────────────┐
│ Duplicate /  │   │ Return error    │
│ Similarity   │   │ (VALIDATION_    │
│ Check        │   │  ERROR / RATE_  │
└──────┬───┬───┘   │  LIMITED)       │
       │   │       └─────────────────┘
       │   ↓ match found
       │  ┌───────────────────┐
       │  │ Mark DUPLICATE    │
       │  │ Link to original  │
       │  │ Notify consumer   │
       │  └───────────────────┘
       ↓ no match
┌─────────────────────────────────────────────────┐
│ Create Complaint (status = SUBMITTED)            │
│  • Store in waste_reports + report_media         │
│  • Generate signed media URLs                    │
│  • Emit event: report.created                    │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Background Jobs (Celery)                         │
│  • Image processing (thumbnail, EXIF strip)      │
│  • Geocoding (reverse geocode → ward/city)       │
│  • Eligibility check + estimated reward          │
│  • Hotspot score update                          │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Dispatch Queue                                   │
│  • Job enters dispatch pool                      │
│  • Route optimizer groups nearby jobs             │
│  • Assigns collector based on proximity/capacity │
│  • Status → ASSIGNED → SCHEDULED                 │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Collection                                       │
│  • Collector receives route + job list            │
│  • Arrives at location                           │
│  • Records actual weight (kg)                    │
│  • Uploads proof photo/video                     │
│  • Status → COLLECTED                            │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Verification                                     │
│  • Admin or automated check:                     │
│    - Proof media is valid                        │
│    - Actual weight within tolerance of estimate  │
│    - Location matches                            │
│  • Status → VERIFIED_RESOLUTION                  │
└──────┬──────────────────┬───────────────────────┘
       ↓ pass             ↓ fail
┌──────────────┐   ┌─────────────────┐
│ Payment      │   │ VERIFICATION_   │
│ Settlement   │   │ FAILED →        │
│ (see §H)     │   │ ESCALATED       │
└──────┬───────┘   └─────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Post-Settlement                                  │
│  • Status → CLOSED                               │
│  • Consumer notified                             │
│  • Footprint recalculated (see §G)               │
│  • Aggregates feed analytics / research lab      │
│  • Emit event: report.closed                     │
└─────────────────────────────────────────────────┘
```

### Exception Handling
| Exception | Handling | Rollback |
|-----------|----------|----------|
| Upload fails mid-stream | Retry with exponential backoff; orphan cleanup job | Mark media as `upload_failed` |
| Geocoding provider down | Queue for retry; proceed without ward assignment | Graceful degradation — report created without ward |
| Duplicate check timeout | Proceed as new report; flag for manual review | Admin can merge later |
| Collector no-show (SLA breach) | Auto-escalate after configurable timeout | Reassign to another collector |
| Weight mismatch beyond tolerance | Flag for admin review; do not auto-settle | Hold payment in `PENDING_REVIEW` |
| Payment provider failure | Retry with idempotency key; alert ops | Ledger entry stays `PENDING`; consumer sees "processing" |

---

## B. Pickup Request

Consumer-initiated scheduled pickup. Shares the dispatch and payment infrastructure with waste reports.

1. Consumer selects material category + approximate weight.
2. Selects location (from saved addresses or GPS).
3. Selects preferred time window (`scheduled_window_start` / `end`).
4. **System checks serviceability** — is the location within a served city/ward?
   - If no → return `NOT_SERVICEABLE` error with nearest served area.
5. Request enters dispatch pool (status = `SUBMITTED`).
6. **Dispatch optimizer** clusters geographically nearby pickup jobs.
7. Route is optimized subject to:
   - Vehicle capacity constraints
   - Time-window constraints
   - Road-network distances (see [ml_and_routing.md](ml_and_routing.md))
8. Collector accepts or is auto-assigned → status = `ASSIGNED` → `SCHEDULED`.
9. Collector arrives:
   - Records actual weight.
   - Uploads proof photo.
   - Status → `COLLECTED`.
10. Verification + settlement (same as §A, steps after collection).

### Real-Time Events
| Event | Channel | Recipient |
|-------|---------|-----------|
| `pickup.assigned` | Push / SSE | Consumer |
| `pickup.collector_en_route` | Push / SSE | Consumer |
| `pickup.collected` | Push / SSE | Consumer |
| `pickup.payment_settled` | Push / SSE | Consumer |
| `pickup.cancelled` | Push / SSE | Consumer + Collector |

---

## C. City Admin Operations

```
┌───────────────┐
│ Login (MFA)   │
└──────┬────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ City Dashboard                                   │
│  • Live operations map (reports, collectors)     │
│  • KPI cards:                                    │
│    - Active complaints                           │
│    - Pending pickups                             │
│    - Overdue jobs (SLA breached)                 │
│    - Hotspot count                               │
│    - Collector utilization %                     │
│    - Today's payout total                        │
│    - Environmental estimates (labeled)           │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Operational Actions                              │
│  • Filter by ward / waste type / date / status   │
│  • Inspect hotspot → view underlying complaints  │
│  • Reassign collector                            │
│  • Escalate complaint                            │
│  • Force-close with reason                       │
│  • Review collector performance metrics          │
│  • Approve/reject marketplace listings           │
│  • Manage awareness content (CMS)                │
│  • Export reports (CSV/PDF)                       │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│ Audit & Governance                               │
│  • Every admin action → audit_logs               │
│  • Before/after JSON snapshots                   │
│  • Immutable; admin cannot delete audit entries   │
│  • Exportable for compliance                     │
└─────────────────────────────────────────────────┘
```

### SLA Monitoring
| Metric | Threshold (configurable) | Action |
|--------|-------------------------|--------|
| Time in SUBMITTED | > 24h | Auto-escalate |
| Time in ASSIGNED | > 48h | Alert admin + reassign |
| Time in SCHEDULED (no collection) | > scheduled window + 2h | Flag as missed pickup |
| Payment in PENDING | > 72h | Alert finance team |

---

## D. Recyclables Marketplace

A specialized peer-to-peer exchange for recyclable materials.

```
Seller creates listing
  ↓
Moderation (admin or automated content check)
  ↓ approved
Listing published (status = ACTIVE)
  ↓
Buyer searches by material / location / price
  ↓
Buyer submits offer
  ↓
Seller reviews offer
  ├→ Accept → status = ACCEPTED
  ├→ Counter-offer → negotiate
  └→ Reject → buyer notified
       ↓ (on accept)
Contact exchange (masked phone/email via platform)
  ↓
Handover / pickup arranged
  ↓
Both parties confirm completion
  ↓
Transaction status = COMPLETED
  ↓
Optional: rating + review
  ↓
Aggregates feed recyclable recovery metrics
```

### Abuse Prevention
- Rate limit on listing creation.
- Listings with suspicious pricing flagged for manual review.
- Contact masking — real phone/email never exposed directly.
- Report/flag mechanism for scam listings.
- Repeat offenders can be suspended.

---

## E. Hotspot Detection Workflow

Identifies areas of waste accumulation risk (not predictions of illegal activity).

```
Operational events (new reports, repeated reports, unresolved complaints)
  ↓
Spatial aggregation (geohash cells or administrative ward boundaries)
  ↓
Feature computation:
  • report_count (time window)
  • unique_reporters
  • weighted_severity
  • repeated_reports (same location)
  • time_since_last_cleanup
  • waste_category_distribution
  • estimated_volume_kg
  ↓
Density / risk calculation → hotspot_score
  ↓
Confidence score + evidence count
  ↓
Threshold filter (configurable per city)
  ↓
Candidate hotspots stored in `hotspots` table
  ↓
Admin review dashboard
  ├→ Verify → status = VERIFIED → feeds dispatch planning
  ├→ Dismiss → status = DISMISSED (with reason)
  └→ Merge → link to existing hotspot
       ↓ (on verify)
Dispatch planning prioritizes verified hotspots
  ↓
Intervention tracked; recurrence monitored
```

### Recurrence Tracking
If a verified hotspot re-emerges within a configurable time window after cleanup, it is flagged as **recurring** and escalated with higher priority.

---

## F. Satellite Candidate Detection Workflow

> **Important**: Satellite detection is assistive, not authoritative (see [decision_log.md](decision_log.md) ADR-004). Candidate dumps require human verification.

```
Satellite / image provider (Sentinel-2, Landsat, commercial)
  ↓
Imagery metadata cataloged in `satellite_observations`
  ↓
Preprocessing pipeline (Celery worker):
  • Cloud masking
  • Atmospheric correction
  • Band selection
  ↓
Feature extraction:
  • Spectral indices (NDVI, etc.)
  • Texture features
  • Temporal change detection
  ↓
Segmentation / classification model
  (version tracked in model governance registry)
  ↓
Candidate polygon generation
  ↓
Confidence score assignment
  ↓
Threshold filter (only candidates above minimum confidence)
  ↓
Store in `dump_candidates` table
  (human_review_status = PENDING)
  ↓
Admin review interface:
  • Side-by-side: satellite image + map overlay
  • Historical imagery comparison
  • Nearby ground-truth reports
  ↓
  ├→ CONFIRMED → enters verified dump layer → available to route optimizer
  ├→ REJECTED → logged with reason for model improvement
  └→ UNCERTAIN → flagged for field verification
```

### Model Governance (per [ml_and_routing.md](ml_and_routing.md))
Every model run records: dataset version, feature version, model version, training date, validation metrics, geographic coverage, confidence threshold.

---

## G. Environmental Footprint Workflow

Produces **estimates** with full methodology traceability — not laboratory measurements (see [environmental_engine.md](environmental_engine.md)).

```
Waste submission (from report or pickup)
  ↓
Verified weight + category (or estimated, clearly labeled)
  ↓
Factor lookup from `footprint_factors` table:
  • CO2e emission factor
  • Methane generation potential
  • Recycling avoidance factor
  • Matched by: category + methodology_version + valid date range
  ↓
Scenario model selection:
  • Unmanaged landfill
  • Managed landfill
  • Composting
  • Anaerobic digestion
  • Material recovery / recycling
  ↓
Calculator engine:
  • CO2e = weight × factor × scenario multiplier
  • Methane = organic_fraction × weight × methane_factor
  • Avoided emissions = recycled_weight × avoidance_factor
  ↓
Result stored in `footprint_calculations`:
  • co2e_kg, methane_kg
  • assumptions_json (all inputs + methodology)
  • uncertainty band (range, not false precision)
  ↓
User dashboard ("My Footprint"):
  • Separated into:
    - reported_estimate (self-reported, unverified)
    - collector_verified (actual weight confirmed)
    - marketplace_recovered (via recyclables exchange)
  • Clear labels: "Estimated" vs "Verified"
  ↓
City aggregate metrics:
  • Summed/averaged across all users in city
  • Feeds research lab dashboards
  • Available for authorized export
```

### "Waste Reality" Storytelling Layer
- "This amount of waste corresponds to…" (contextual analogies)
- City totals with trend indicators
- Scenario comparison (what if composted vs landfilled?)
- Disposal pathway visualization
- **All analogies clearly labeled as illustrative, not measured facts**

---

## H. Payment Workflow

> **Invariant**: A user-visible amount is not final until actual collection weight and verification pass the settlement rules. Never pay solely on self-reported weight. See [security.md](security.md) for fraud controls.

```
Report / pickup created
  ↓
Estimated reward calculated (based on category + estimated weight + city rules)
  ↓
Consumer sees provisional amount (clearly labeled "estimated")
  ↓
Collector records actual weight at pickup
  ↓
┌─────────────────────────────────────────────────┐
│ Weight Validation                                │
│  • |actual - estimated| ≤ tolerance %?           │
│  • tolerance is configurable per category        │
│    ├→ Within tolerance → proceed                 │
│    └→ Outside tolerance → flag for admin review  │
└──────┬──────────────────────────────────────────┘
       ↓
Ledger entry created in `payments_ledger`:
  • estimated_amount (from report)
  • final_amount (from actual weight × rate)
  • status = PENDING
  ↓
Payout authorization:
  • Business rules check (minimum payout, daily limits)
  • Fraud score check
  ↓
Payment provider call (with Idempotency-Key header):
  • Initiate payout
  • Await webhook confirmation
  ↓
┌─────────────────────────────────────────────────┐
│ Webhook Processing                               │
│  • Verify webhook signature                      │
│  • Match to ledger entry via provider_reference   │
│  • Update status:                                │
│    ├→ SUCCESS → status = SETTLED                 │
│    ├→ FAILED → status = FAILED → retry queue     │
│    └→ REVERSED → status = REVERSED → alert ops   │
└──────┬──────────────────────────────────────────┘
       ↓
Reconciliation job (daily):
  • Compare ledger vs provider statements
  • Flag discrepancies for manual review
  • Generate reconciliation report
```

### Payment Safety Controls
| Control | Implementation |
|---------|---------------|
| No client-provided amounts | Amount derived server-side from weight × rate |
| Idempotency | `Idempotency-Key` header on all payment POSTs |
| Webhook verification | Cryptographic signature check on provider callbacks |
| Internal ledger | Source of truth — provider state is secondary |
| Retry with backoff | Failed payouts retried 3× with exponential backoff |
| Daily reconciliation | Automated comparison of ledger vs provider |
| Fraud detection | Anomaly detection on payout patterns |

---

## Cross-Workflow Event Map

Events emitted across workflows that trigger downstream processing:

| Event | Source Workflow | Consumers |
|-------|---------------|-----------|
| `report.created` | A (Report) | Hotspot updater, Dispatch queue, Notifications |
| `report.closed` | A (Report) | Footprint calculator, Analytics ETL, Notifications |
| `pickup.assigned` | B (Pickup) | Consumer notification, Collector app |
| `pickup.collected` | B (Pickup) | Verification queue, Weight validator |
| `payment.settled` | H (Payment) | Consumer notification, Reconciliation, Analytics |
| `payment.failed` | H (Payment) | Retry queue, Ops alert |
| `hotspot.detected` | E (Hotspot) | Admin dashboard, Dispatch prioritization |
| `satellite.candidate_found` | F (Satellite) | Admin review queue |
| `marketplace.listing_created` | D (Marketplace) | Moderation queue |
| `footprint.calculated` | G (Footprint) | User dashboard, City aggregates |

---

## Workflow Dependencies

```
A (Report) ──────→ E (Hotspot) ──────→ C (Admin)
    │                                      ↑
    ├──→ G (Footprint)                     │
    │                                      │
    └──→ H (Payment)                F (Satellite)
              ↑
B (Pickup) ──┘          D (Marketplace) ──→ G (Footprint)
```

- **A & B** are entry points — they feed all downstream workflows.
- **H (Payment)** is always the terminal step for A and B.
- **E (Hotspot)** and **F (Satellite)** feed back into **C (Admin)** for operational decisions.
- **D (Marketplace)** contributes recovered materials to **G (Footprint)** calculations.
