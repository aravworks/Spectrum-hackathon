from datetime import datetime
from typing import List, Optional, Tuple
from fastapi import HTTPException

from app.schemas.footprint import (
    SimulationRequest, 
    SimulationResponse, 
    FootprintCalculationCreate, 
    FootprintCalculationResponse,
    AggregateFootprintResponse
)

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace with SQLAlchemy queries for `footprint_factors` and `footprint_calculations`.

# Mocks `footprint_factors` table. Format: category_id -> (co2e_factor, ch4_factor, factor_id_ref)
MOCK_FACTORS = {
    1: (1.5, 0.01, 101),   # Plastic
    2: (0.1, 0.25, 102),   # Organic
    3: (2.5, 0.05, 103),   # E-Waste
    4: (3.0, 0.10, 104),   # Hazardous
    5: (0.5, 0.02, 105),   # Paper
}

MOCK_CALCULATIONS = []
_calc_id_counter = 1

class FootprintService:
    
    @staticmethod
    def _get_factors(category_id: int) -> Tuple[float, float, int]:
        """
        Internal method to fetch factors.
        TODO: db.query(FootprintFactor).filter(...).first()
        """
        factors = MOCK_FACTORS.get(category_id)
        if not factors:
            # Fallback to generic mixed waste factors if category unknown
            return (1.0, 0.1, 999) 
        return factors

    @staticmethod
    def simulate(request: SimulationRequest) -> SimulationResponse:
        """
        Runs the emissions math without saving to the DB.
        Used for the Treatments Simulation UI.
        """
        co2e_factor, ch4_factor, factor_id = FootprintService._get_factors(request.category_id)
        
        co2e = request.input_weight_kg * co2e_factor
        methane = request.input_weight_kg * ch4_factor
        
        return SimulationResponse(
            category_id=request.category_id,
            input_weight_kg=request.input_weight_kg,
            co2e_kg=co2e,
            methane_kg=methane,
            formula_used={
                "co2e_multiplier": co2e_factor,
                "ch4_multiplier": ch4_factor,
                "factor_reference_id": factor_id
            }
        )

    @staticmethod
    def calculate_and_save(user_id: str, data: FootprintCalculationCreate) -> FootprintCalculationResponse:
        """
        Runs the math and permanently records it in `footprint_calculations`.
        Triggered when a waste pickup actually completes.
        """
        global _calc_id_counter
        
        co2e_factor, ch4_factor, factor_id = FootprintService._get_factors(data.category_id)
        
        calc_dict = {
            "id": _calc_id_counter,
            "user_id": user_id,
            "city_id": data.city_id,
            "input_weight_kg": data.input_weight_kg,
            "category_id": data.category_id,
            "factor_id_used": factor_id,
            "co2e_kg": data.input_weight_kg * co2e_factor,
            "methane_kg": data.input_weight_kg * ch4_factor,
            "assumptions_json": {"version": "1.0", "source": "API_CALC"},
            "calculated_at": datetime.utcnow()
        }
        
        MOCK_CALCULATIONS.append(calc_dict)
        _calc_id_counter += 1
        
        return FootprintCalculationResponse(**calc_dict)

    @staticmethod
    def aggregate_for_user(user_id: str) -> AggregateFootprintResponse:
        """Sums up total lifetime impact for a single user."""
        user_calcs = [c for c in MOCK_CALCULATIONS if c["user_id"] == user_id]
        
        return AggregateFootprintResponse(
            entity_type="USER",
            entity_id=user_id,
            total_co2e_kg=sum(c["co2e_kg"] for c in user_calcs),
            total_methane_kg=sum(c["methane_kg"] for c in user_calcs),
            total_waste_processed_kg=sum(c["input_weight_kg"] for c in user_calcs)
        )
        
    @staticmethod
    def aggregate_for_city(city_id: int) -> AggregateFootprintResponse:
        """Sums up total lifetime impact for an entire city/municipality."""
        city_calcs = [c for c in MOCK_CALCULATIONS if c["city_id"] == city_id]
        
        return AggregateFootprintResponse(
            entity_type="CITY",
            entity_id=str(city_id),
            total_co2e_kg=sum(c["co2e_kg"] for c in city_calcs),
            total_methane_kg=sum(c["methane_kg"] for c in city_calcs),
            total_waste_processed_kg=sum(c["input_weight_kg"] for c in city_calcs)
        )
