from fastapi import APIRouter
from rialo_sdk.hooks import rialo_stream, rialo_rtx, rialo_sfs, rialo_readpath

router = APIRouter()

@router.get("/stream/{pair}")
async def get_stream_feed(pair: str):
    return await rialo_stream.get_feed(pair.upper())

@router.get("/reactive-log")
def get_reactive_log():
    return {"log": rialo_rtx.get_log(), "bots_required": 0}

@router.post("/predicate")
def register_predicate(predicate: str, action: str, threshold: float):
    return rialo_rtx.register_predicate(predicate, action, threshold)

@router.get("/sfs/estimate")
def estimate_sfs(staked_rlo: float = 1000.0, routing_fraction: float = 0.1):
    return rialo_sfs.estimate_yield(staked_rlo, routing_fraction)

@router.get("/status")
def rialo_status():
    return {
        "rialo_edge":      {"status": "sdk_ready", "note": "Web2 calls inside consensus"},
        "rialo_stream":    {"status": "sdk_ready", "note": "Native data feeds, no oracle"},
        "rialo_rtx":       {"status": "sdk_ready", "note": "Predicates fire inside validators"},
        "rialo_readpath":  {"status": "sdk_ready", "note": "Validator state, no indexer"},
        "rialo_sfs":       {"status": "sdk_ready", "note": "Yield funds gas automatically"},
        "mainnet":         "2026",
        "testnet":         "live",
    }
