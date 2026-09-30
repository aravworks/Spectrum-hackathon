# ML, Routing and Dump Identification

## Phase 1: deterministic routing
Use road-network routing and a vehicle/job constraint model.

Inputs:
- depot
- pickup points
- vehicle capacity
- time windows
- service time
- road distance/time

Start with:
1. nearest-neighbor baseline
2. 2-opt improvement
3. vehicle routing problem solver (OR-Tools) when constraints grow

## Phase 2: hotspot analytics
Create spatial cells/geohashes or administrative zones.

Features:
- report count
- unique reporters
- weighted severity
- repeated reports
- time since cleanup
- waste category
- estimated volume

Output:
`hotspot_score` + confidence + evidence.

Do not call this a prediction of illegal activity; call it a waste-accumulation risk signal.

## Phase 3: satellite candidate detection
Satellite imagery can produce candidate areas showing signatures compatible with waste dumps. It cannot by itself prove a dump exists.

Workflow:
- imagery selection
- cloud masking
- spectral/texture features
- segmentation/classification
- polygon generation
- confidence score
- human review
- verification record

## Model governance
Store:
- dataset version
- feature version
- model version
- training date
- validation metrics
- geographic coverage
- confidence threshold

## Route + dump relationship
Route optimization should use verified dump/transfer-station locations and service destinations. A candidate dump detected from imagery must not become a collection destination until verified.

## Recommended initial stack
Python + GeoPandas + Shapely + NetworkX/OR-Tools + scikit-learn.
Later: PyTorch/segmentation models.
