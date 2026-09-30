from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class FactorType(str):
    CO2E = "CO2e"
    CH4 = "CH4"

class SimulationRequest(BaseModel):
    category_id: int
    input_weight_kg: float = Field(..., gt=0)
    city_id: Optional[int] = None

class SimulationResponse(BaseModel):
    category_id: int
    input_weight_kg: float
    co2e_kg: float
    methane_kg: float
    formula_used: Dict[str, Any]

class FootprintCalculationCreate(BaseModel):
    category_id: int
    input_weight_kg: float = Field(..., gt=0)
    city_id: int

class FootprintCalculationResponse(BaseModel):
    id: int
    user_id: str
    city_id: int
    input_weight_kg: float
    category_id: int
    factor_id_used: int
    co2e_kg: float
    methane_kg: float
    assumptions_json: Optional[Dict[str, Any]] = None
    calculated_at: datetime

    class Config:
        from_attributes = True

class AggregateFootprintResponse(BaseModel):
    entity_type: str  # "USER" or "CITY"
    entity_id: str
    total_co2e_kg: float
    total_methane_kg: float
    total_waste_processed_kg: float
