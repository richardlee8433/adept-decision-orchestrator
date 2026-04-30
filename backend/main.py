import asyncio
import hashlib
import time
import random
from enum import Enum
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title="ADEPT Decision Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Pydantic Models ---

class DecisionEnum(str, Enum):
    APPROVE = "APPROVE"
    STEP_UP = "STEP-UP"
    REVIEW = "REVIEW"
    DECLINE = "DECLINE"

class TransactionIn(BaseModel):
    id: str
    amount: float
    merchant_name: str
    merchant_mcc: str
    ip_country: str
    bin_country: str

class FeatureState(BaseModel):
    velocity_tx_per_hour: int
    device_first_seen_hours: int
    risk_composite_score: float

class StrategyConfig(BaseModel):
    weights: Dict[str, float]  # Expecting keys: base, geo, behavior

    @field_validator("weights")
    @classmethod
    def validate_weights(cls, v):
        required_keys = {"base", "geo", "behavior"}
        if not required_keys.issubset(v.keys()):
            raise ValueError(f"Weights must contain {required_keys}")
        if sum(v.values()) != 100:
            raise ValueError("Weights must sum to 100")
        return v

class RuleEvaluation(BaseModel):
    step: str
    match: bool
    ms: float

class DecisionOut(BaseModel):
    tx_id: str
    decision: DecisionEnum
    risk_score: float
    total_latency_ms: float
    path: List[RuleEvaluation]
    why: str
    hash: str

# --- 2. Tier 2 Dummy AI Functions ---

async def call_base_model() -> float:
    start = time.perf_counter()
    await asyncio.sleep(random.uniform(0.01, 0.03))
    return random.random()

async def call_geo_ai() -> float:
    start = time.perf_counter()
    await asyncio.sleep(random.uniform(0.01, 0.03))
    return random.random()

async def call_behavior_engine() -> float:
    start = time.perf_counter()
    await asyncio.sleep(random.uniform(0.01, 0.03))
    return random.random()

# --- 3. The Orchestrator ---

@app.post("/v1/decision", response_model=DecisionOut)
async def get_decision(
    tx: TransactionIn = Body(...),
    features: FeatureState = Body(...),
    strategy: StrategyConfig = Body(...)
):
    overall_start = time.perf_counter()
    path: List[RuleEvaluation] = []
    final_decision = None
    why = "Rules passed"
    final_risk_score = 0.0

    # --- Tier 1: Hard Rules Engine (Synchronous Fall-Through) ---
    
    # Rule 1 (R-001): High amount & Geo-Mismatch
    r001_start = time.perf_counter()
    r001_match = tx.amount > 2500 and tx.ip_country != tx.bin_country
    r001_ms = (time.perf_counter() - r001_start) * 1000
    path.append(RuleEvaluation(step="R-001", match=r001_match, ms=r001_ms))
    
    if r001_match:
        final_decision = DecisionEnum.STEP_UP
        why = "High value transaction with cross-border mismatch (R-001)"

    # Rule 2 (R-002): Velocity Check
    if not final_decision:
        r002_start = time.perf_counter()
        r002_match = features.velocity_tx_per_hour > 12
        r002_ms = (time.perf_counter() - r002_start) * 1000
        path.append(RuleEvaluation(step="R-002", match=r002_match, ms=r002_ms))
        
        if r002_match:
            final_decision = DecisionEnum.DECLINE
            why = "Excessive hourly transaction velocity (R-002)"
    else:
        # Rule was skipped because R-001 matched
        path.append(RuleEvaluation(step="R-002", match=False, ms=0.0))

    # --- Tier 2: AI Inference (Async Orchestration) ---
    
    if not final_decision:
        tier2_start = time.perf_counter()
        # Run AI models concurrently
        base_task = call_base_model()
        geo_task = call_geo_ai()
        behavior_task = call_behavior_engine()
        
        results = await asyncio.gather(base_task, geo_task, behavior_task)
        base_score, geo_score, behavior_score = results
        
        # Calculate Weighted Risk Score
        w = strategy.weights
        final_risk_score = (
            (base_score * w["base"]) +
            (geo_score * w["geo"]) +
            (behavior_score * w["behavior"])
        ) / 100.0
        
        tier2_ms = (time.perf_counter() - tier2_start) * 1000
        path.append(RuleEvaluation(step="TIER-2-AI", match=True, ms=tier2_ms))
        
        # Determine Decision from Score
        if final_risk_score > 0.8:
            final_decision = DecisionEnum.DECLINE
            why = "Aggregated AI risk score exceeds decline threshold"
        elif final_risk_score > 0.6:
            final_decision = DecisionEnum.REVIEW
            why = "AI risk score in manual review range"
        else:
            final_decision = DecisionEnum.APPROVE
            why = "AI risk score within acceptable limits"
    else:
        # Tier 2 skipped because Tier 1 matched
        path.append(RuleEvaluation(step="TIER-2-AI", match=False, ms=0.0))

    # --- Final Aggregation & Hashing ---
    
    total_latency_ms = (time.perf_counter() - overall_start) * 1000
    timestamp = datetime.utcnow().isoformat()
    
    # SHA-256 (tx_id + decision + timestamp)
    hash_input = f"{tx.id}{final_decision.value}{timestamp}"
    decision_hash = hashlib.sha256(hash_input.encode()).hexdigest()
    
    return DecisionOut(
        tx_id=tx.id,
        decision=final_decision,
        risk_score=round(final_risk_score, 4),
        total_latency_ms=round(total_latency_ms, 2),
        path=path,
        why=why,
        hash=decision_hash
    )

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
