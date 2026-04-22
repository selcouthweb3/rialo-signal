import yfinance as yf
from app.services.cache import cache

RWA_TICKERS = {
    "GOLD":  {"ticker": "GC=F",  "name": "Gold Spot",       "type": "commodity"},
    "SPX":   {"ticker": "^GSPC", "name": "S&P 500",         "type": "equity"},
    "US10Y": {"ticker": "^TNX",  "name": "US 10Y Treasury", "type": "bond"},
    "OIL":   {"ticker": "CL=F",  "name": "Crude Oil",       "type": "commodity"},
}

RWA_FALLBACK = {
    "GOLD":  {"name": "Gold Spot",       "price": 3314, "change_24h": 0.8,  "type": "commodity"},
    "SPX":   {"name": "S&P 500",         "price": 5282, "change_24h": 0.5,  "type": "equity"},
    "US10Y": {"name": "US 10Y Treasury", "price": 4.40, "change_24h": -0.3, "type": "bond"},
    "OIL":   {"name": "Crude Oil",       "price": 64.1, "change_24h": -0.8, "type": "commodity"},
}

PRICE_BOUNDS = {
    "GOLD":  (1500, 5500),
    "SPX":   (3000, 8000),
    "US10Y": (0.5,  8.0),
    "OIL":   (30,   150),
}

def get_rwa_prices() -> dict:
    cache_key = "rwa_prices_yfinance"
    cached = cache.get(cache_key)
    if cached:
        return cached
    result = {}
    for sym, meta in RWA_TICKERS.items():
        try:
            ticker = yf.Ticker(meta["ticker"])
            hist = ticker.history(period="5d", interval="1d")
            if hist.empty or len(hist) < 1:
                raise ValueError("No data")
            latest_price = round(float(hist["Close"].iloc[-1]), 2)
            prev_price = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else latest_price
            change_24h = round(((latest_price - prev_price) / prev_price) * 100, 2)
            lo, hi = PRICE_BOUNDS[sym]
            if not (lo <= latest_price <= hi):
                raise ValueError(f"Out of range: {latest_price}")
            result[sym] = {
                "symbol": sym,
                "name": meta["name"],
                "price": latest_price,
                "change_24h": change_24h,
                "type": meta["type"],
                "source": "yfinance",
                "delay_note": "15 min delayed",
                "rialo_sdk_note": "Replace with Rialo Stream on mainnet"
            }
            print(f"RWA OK: {sym} = {latest_price}")
        except Exception as e:
            print(f"RWA fallback for {sym}: {e}")
            fb = RWA_FALLBACK[sym]
            result[sym] = {**fb, "symbol": sym, "source": "fallback", "delay_note": "15 min delayed"}
    cache.set(cache_key, result, ttl=900)
    return result
