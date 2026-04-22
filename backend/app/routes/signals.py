from fastapi import APIRouter
from app.services.coingecko import fetch_crypto_prices, get_rwa_prices
from app.services.signal_engine import generate_live_signals
from app.services.cache import cache

router = APIRouter()

@router.get("/live")
async def get_live_signals():
    cached = cache.get("signals_live")
    if cached:
        return cached

    crypto = await fetch_crypto_prices(["BTC", "ETH", "SOL", "BNB", "AVAX"])
    rwa = get_rwa_prices()
    signals = generate_live_signals(crypto, rwa)

    cache.set("signals_live", signals, ttl=15)
    return signals

@router.get("/pump/{symbol}")
async def get_pump_signals(symbol: str):
    symbol = symbol.upper()
    crypto = await fetch_crypto_prices([symbol])
    rwa = get_rwa_prices()
    signals = generate_live_signals(crypto, rwa)
    return {
        "symbol": symbol,
        "pump_signals": signals["pump_signals"],
        "risk": signals["risk"],
    }
