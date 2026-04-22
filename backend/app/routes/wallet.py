from fastapi import APIRouter, HTTPException
from app.services.wallet_service import analyze_wallet
from app.services.cache import cache

router = APIRouter()

@router.get("/{address}")
async def get_wallet_analysis(address: str):
    if len(address) < 6:
        raise HTTPException(status_code=400, detail="Invalid address")

    cache_key = f"wallet_{address}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    result = analyze_wallet(address)
    cache.set(cache_key, result, ttl=60)
    return result
