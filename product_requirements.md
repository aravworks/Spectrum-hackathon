# Product Requirements

## Personas
1. Consumer — reports waste, requests pickup, tracks complaints, sees footprint, receives payment.
2. Collector — receives routes/jobs, confirms pickup, records actual weight and proof.
3. City Admin — monitors city operations, assigns/oversees work, manages content and escalations.
4. National/Admin Analyst — cross-city analytics, policy/research datasets and configuration.
5. Recycler/Bulk Buyer — lists demand for recyclable materials and receives seller offers.
6. Researcher — accesses approved anonymized datasets and environmental metrics.
7. Content Editor — manages awareness/blog content.

## Functional requirements

### Authentication
- Consumer/admin login
- Role-based authorization
- Email/phone verification
- Password reset
- Optional MFA for privileged users
- Session/token revocation

### Waste issue reporting
- GPS/manual location
- photo/video evidence
- waste category/subcategory
- approximate weight
- severity
- description
- duplicate-report detection
- status tracking
- payment eligibility

### Pickup
- pickup request
- preferred window
- estimated weight
- collector assignment
- route generation
- pickup proof
- actual weight
- settlement/payment state

### Complaint tracking
States:
SUBMITTED → VERIFIED → ASSIGNED → SCHEDULED → COLLECTED → VERIFIED_RESOLUTION → CLOSED
Exception states: REJECTED, DUPLICATE, CANCELLED, ESCALATED.

### Admin dashboard
- city map
- active complaints
- pending pickups
- overdue jobs
- hotspot density
- collector utilization
- recyclable material volumes
- payout totals
- environmental estimates
- city comparisons

### Awareness
- waste category pages
- disposal guidance
- benefits/risks
- emissions information
- recycling alternatives
- articles/blogs
- quizzes/acknowledgements

### Recyclables marketplace
Like a specialized OLX:
- seller listing
- material type
- approximate quantity
- location/radius
- expected price
- buyer offer
- chat/contact masking
- transaction state
- rating/reporting
- moderation

### Environmental footprint
- personal footprint from submitted/verified waste
- city aggregate footprint
- estimated landfill methane potential
- avoided emissions from recycling/reuse
- scenario simulator
- clear assumptions and confidence labels

### GIS/research lab
- raw operational metrics
- aggregate environmental metrics
- map layers
- export jobs
- dataset catalog
- role-based access
- audit trail

## Non-functional requirements
- API-first
- scalable horizontally
- asynchronous processing for images, GIS and ML
- idempotent critical commands
- auditable payments and status transitions
- privacy by default
- observable
- mobile-first consumer experience
- graceful degradation if external map/satellite providers fail
