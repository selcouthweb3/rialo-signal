import httpx
import os
from app.services.cache import cache

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
API_KEY = os.getenv("COINGECKO_API_KEY", "")

SUPPORTED_IDS = {
    "BTC":  "bitcoin",
    "ETH":  "ethereum",
    "SOL":  "solana",
    "BNB":  "binancecoin",
    "AVAX": "avalanche-2",
    "LINK": "chainlink",
    "UNI":  "uniswap",
    "AAVE": "aave",
}

RWA_SIMULATED = {
    "US10Y": {"name": "US 10Y Treasury", "price": 4.40,  "change_24h": -0.3, "type": "bond"},
    "GOLD":  {"name": "Gold Spot",        "price": 3314,  "change_24h": 0.8,  "type": "commodity"},
    "SPX":   {"name": "S&P 500",          "price": 5282,  "change_24h": 0.5,  "type": "equity"},
    "OIL":   {"name": "Crude Oil",        "price": 64.1,  "change_24h": -0.8, "type": "commodity"},
}

async def fetch_crypto_prices(symbols: list[str]) -> dict:
    cache_key = f"prices_{'_'.join(sorted(symbols))}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    ids = [SUPPORTED_IDS[s] for s in symbols if s in SUPPORTED_IDS]
    if not ids:
        return {}

    headers = {"x-cg-demo-api-key": API_KEY} if API_KEY else {}
    url = f"{COINGECKO_BASE}/simple/price"
    params = {
        "ids": ",".join(ids),
        "vs_currencies": "usd",
        "include_24hr_change": "true",
        "include_market_cap": "true",
        "include_24hr_vol": "true",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            raw = resp.json()

        result = {}
        for sym in symbols:
            cg_id = SUPPORTED_IDS.get(sym)
            if cg_id and cg_id in raw:
                d = raw[cg_id]
                result[sym] = {
                    "symbol":     sym,
                    "price":      round(d.get("usd", 0), 2),
                    "change_24h": round(d.get("usd_24h_change", 0), 2),
                    "market_cap": d.get("usd_market_cap", 0),
                    "volume_24h": d.get("usd_24h_vol", 0),
                    "type":       "crypto",
                    "source":     "coingecko_live"
                }

        cache.set(cache_key, result, ttl=60)
        return result

    except Exception as e:
        print(f"CoinGecko error: {e} — using fallback")
        return _fallback_crypto_prices(symbols)

def _fallback_crypto_prices(symbols: list[str]) -> dict:
    fallback = {
        "BTC":  {"price": 84500,  "change_24h": -0.84, "market_cap": 1670000000000},
        "ETH":  {"price": 2310,   "change_24h": -2.24, "market_cap": 278000000000},
        "SOL":  {"price": 135,    "change_24h": -1.12, "market_cap": 65000000000},
        "BNB":  {"price": 624,    "change_24h": -1.56, "market_cap": 88000000000},
        "AVAX": {"price": 19.8,   "change_24h": -1.75, "market_cap": 8200000000},
        "LINK": {"price": 13.4,   "change_24h": -0.9,  "market_cap": 8000000000},
        "UNI":  {"price": 6.2,    "change_24h": -1.1,  "market_cap": 3700000000},
        "AAVE": {"price": 148,    "change_24h": 0.8,   "market_cap": 2200000000},
    }
    return {
        s: {**fallback[s], "symbol": s, "type": "crypto", "source": "fallback"}
        for s in symbols if s in fallback
    }

def get_rwa_prices() -> dict:
    result = {}
    for sym, data in RWA_SIMULATED.items():
        result[sym] = {
            **data,
            "symbol": sym,
            "source": "simulated",
            "rialo_sdk_note": "Replace with Rialo Stream on mainnet"
        }
    return result
