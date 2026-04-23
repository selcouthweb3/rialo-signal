from fastapi import APIRouter, Query
from app.services.coingecko import fetch_crypto_prices
from app.services.rwa_service import get_rwa_prices
from typing import Optional

router = APIRouter()

@router.get("/crypto")
async def get_crypto_prices(symbols: Optional[str] = Query(default="BTC,ETH,SOL,BNB,AVAX")):
    sym_list = [s.strip().upper() for s in symbols.split(",")]
    prices = await fetch_crypto_prices(sym_list)
    return {"data": prices, "count": len(prices)}

@router.get("/rwa")
def get_rwa():
    return {"data": get_rwa_prices()}

@router.get("/all")
async def get_all_prices():
    crypto = await fetch_crypto_prices(["BTC", "ETH", "SOL", "BNB", "AVAX", "LINK"])
    rwa = get_rwa_prices()
    return {"crypto": crypto, "rwa": rwa}

@router.get("/debug")
async def debug_prices():
    import os
    key = os.getenv("COINGECKO_API_KEY", "NOT SET")
    return {
        "coingecko_key_set": key != "NOT SET",
        "key_preview": key[:8] + "..." if key != "NOT SET" else "NOT SET"
    }
