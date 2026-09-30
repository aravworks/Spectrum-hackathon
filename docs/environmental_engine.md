# Environmental / Carbon / Methane Engine

## Purpose
Provide educational and analytical estimates, not laboratory measurements.

## Inputs
- waste category
- weight
- treatment/disposal scenario
- recycling rate
- organic fraction
- locality/city
- methodology version

## Outputs
- estimated CO2e
- estimated methane potential
- avoided emissions scenario
- assumptions
- uncertainty/confidence
- source/methodology reference

## Calculation architecture
`WasteRecord -> FactorResolver -> ScenarioModel -> Calculator -> Result -> Explanation`

Factors must be versioned and sourced. Never bury constants inside frontend code.

## Methane simulator
For organic waste, allow scenario comparison:
- unmanaged landfill
- managed landfill
- composting
- anaerobic digestion
- material recovery/recycling where applicable

Show ranges rather than false precision.

## User “My Footprint”
Only include verified or clearly labeled estimated waste. Separate:
- `reported_estimate`
- `collector_verified`
- `marketplace_recovered`

## Waste Reality
A storytelling layer:
- “This amount of waste corresponds to…”
- city totals
- scenario comparison
- disposal pathway
- estimated emissions

Do not present analogies as measured facts.

## Governance
Every result stores:
- factor source
- methodology version
- calculation timestamp
- assumptions
- uncertainty band
