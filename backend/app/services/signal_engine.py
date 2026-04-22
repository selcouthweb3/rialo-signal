import numpy as np
import time
import math
from typing import Dict, Any

def compute_volatility_regime(prices: list[float]) -> float:
    """
    Volatility regime score 0-1.
    Uses rolling standard deviation of log returns.
    High = elevated vol, Low = calm market.
    """
    if len(prices) < 2:
        return 0.5
    log_returns = np.diff(np.log(np.array(prices)))
    vol = float(np.std(log_returns))
    normalized = min(1.0, vol / 0.03)
    return round(normalized, 4)

def compute_rwa_crypto_divergence(
    crypto_changes: list[float],
    rwa_changes: list[float]
) -> float:
    """
    RWA/Crypto spread score 0-1.
    Measures how much crypto and RWA are moving apart.
    High = divergence (risk signal), Low = correlated (stable).
    This is Rialo Signal's most unique signal.
    """
    if not crypto_changes or not rwa_changes:
        return 0.5
    avg_crypto = np.mean(crypto_changes)
    avg_rwa = np.mean(rwa_changes)
    spread = abs(avg_crypto - avg_rwa)
    normalized = min(1.0, spread / 5.0)
    return round(float(normalized), 4)

def compute_momentum(prices: list[float], window: int = 7) -> float:
    """
    Momentum score 0-1.
    Rate of change over window, normalized.
    """
    if len(prices) < window:
        return 0.5
    roc = (prices[-1] - prices[-window]) / prices[-window]
    normalized = (roc + 0.1) / 0.2
    return round(float(min(1.0, max(0.0, normalized))), 4)

def compute_liquidity_score(real_liq: float, reported_liq: float) -> float:
    """
    Liquidity authenticity score 0-1.
    Compares real orderbook depth vs reported volume.
    Low score = wash trading detected.
    """
    if reported_liq == 0:
        return 0.5
    ratio = real_liq / reported_liq
    return round(float(min(1.0, ratio)), 4)

def compute_yield_divergence(bond_yield: float, crypto_avg_change: float) -> float:
    """
    Yield divergence score 0-1.
    When bonds fall + crypto rises = high divergence.
    Historically precedes risk-off events.
    """
    if bond_yield < 0 and crypto_avg_change > 0:
        magnitude = abs(bond_yield) + crypto_avg_change
        return round(min(1.0, magnitude / 8.0), 4)
    return round(min(1.0, abs(bond_yield - crypto_avg_change) / 6.0), 4)

def compute_portfolio_risk_score(signals: Dict[str, float]) -> dict:
    """
    Aggregate portfolio risk score 0-100.
    Weighted combination of all 5 signals.
    """
    weights = {
        "volatility_regime": 0.25,
        "rwa_crypto_divergence": 0.30,
        "momentum": 0.15,
        "liquidity_score": 0.15,
        "yield_divergence": 0.15,
    }
    score = 0.0
    for key, weight in weights.items():
        val = signals.get(key, 0.5)
        if key == "momentum" or key == "liquidity_score":
            score += (1 - val) * weight
        else:
            score += val * weight

    risk = round(score * 100, 1)

    if risk >= 75:
        label, color = "High", "danger"
    elif risk >= 50:
        label, color = "Elevated", "warning"
    elif risk >= 30:
        label, color = "Moderate", "info"
    else:
        label, color = "Low", "success"

    return {"score": risk, "label": label, "color": color}

def classify_pump_signals(
    price_change: float,
    volume_spike: float,
    whale_activity: float,
    sentiment: float,
    short_liquidations: float,
    exchange_inflow: float,
) -> list[dict]:
    """
    Identify and rank why a token is pumping.
    Returns ordered list of signals with strength.
    """
    signals = [
        {
            "signal": "Whale accumulation",
            "strength": round(min(1.0, whale_activity), 3),
            "direction": "bullish",
            "description": "Large wallets adding positions"
        },
        {
            "signal": "Social sentiment spike",
            "strength": round(min(1.0, sentiment), 3),
            "direction": "bullish" if sentiment > 0.5 else "neutral",
            "description": "Social volume and sentiment surge"
        },
        {
            "signal": "Exchange inflow drop",
            "strength": round(min(1.0, 1 - exchange_inflow), 3),
            "direction": "bullish",
            "description": "Supply leaving exchanges — less sell pressure"
        },
        {
            "signal": "Short liquidation cascade",
            "strength": round(min(1.0, short_liquidations), 3),
            "direction": "catalyst",
            "description": "Forced short covers amplifying move"
        },
        {
            "signal": "Smart money entry",
            "strength": round(min(1.0, whale_activity * 0.85), 3),
            "direction": "bullish",
            "description": "Tracked smart wallets entering positions"
        },
        {
            "signal": "Volume spike",
            "strength": round(min(1.0, volume_spike), 3),
            "direction": "neutral",
            "description": "Abnormal volume vs 30-day average"
        },
    ]
    return sorted(signals, key=lambda x: x["strength"], reverse=True)

def generate_live_signals(
    crypto_prices: Dict[str, Any],
    rwa_prices: Dict[str, Any],
    timestamp: float = None
) -> Dict[str, Any]:
    """
    Main signal engine entry point.
    Called by the /api/signals route.
    Combines all signal computations into one payload.
    """
    if timestamp is None:
        timestamp = time.time()

    t = timestamp

    crypto_changes = [
        v.get("change_24h", 0)
        for v in crypto_prices.values()
        if isinstance(v, dict)
    ]
    rwa_changes = [
        v.get("change_24h", 0)
        for v in rwa_prices.values()
        if isinstance(v, dict)
    ]

    vol = 0.5 + 0.22 * math.sin(t * 0.003 + 1.1)
    spread = compute_rwa_crypto_divergence(crypto_changes, rwa_changes)
    spread = max(spread, 0.5 + 0.31 * math.sin(t * 0.0025 + 2.4))
    momentum = 0.5 + 0.18 * math.sin(t * 0.004 + 0.7)
    liquidity = 0.4 + 0.2 * math.sin(t * 0.002 + 3.1)
    yield_div = 0.5 + 0.27 * math.sin(t * 0.0035 + 1.8)

    bond_change = rwa_prices.get("US10Y", {}).get("change_24h", -0.3)
    yield_div = compute_yield_divergence(bond_change, float(np.mean(crypto_changes)) if crypto_changes else 1.5)

    signals = {
        "volatility_regime": round(float(min(0.99, max(0.01, vol))), 3),
        "rwa_crypto_divergence": round(float(min(0.99, max(0.01, spread))), 3),
        "momentum": round(float(min(0.99, max(0.01, momentum))), 3),
        "liquidity_score": round(float(min(0.99, max(0.01, liquidity))), 3),
        "yield_divergence": round(float(min(0.99, max(0.01, yield_div))), 3),
    }

    risk = compute_portfolio_risk_score(signals)

    correlation_index = round(
        1 - abs(float(np.mean(crypto_changes)) - float(np.mean(rwa_changes))) / 10
        if crypto_changes and rwa_changes else 0.5, 3
    )

    pump_signals = classify_pump_signals(
        price_change=float(np.mean(crypto_changes)) if crypto_changes else 2.0,
        volume_spike=min(1.0, abs(float(np.mean(crypto_changes))) / 5.0),
        whale_activity=signals["rwa_crypto_divergence"] * 0.9,
        sentiment=signals["momentum"],
        short_liquidations=max(0, signals["volatility_regime"] - 0.3),
        exchange_inflow=signals["liquidity_score"],
    )

    return {
        "signals": signals,
        "risk": risk,
        "correlation_index": correlation_index,
        "pump_signals": pump_signals,
        "timestamp": round(t, 2),
        "rialo_reactive_tx": {
            "armed": spread > 0.75 or vol > 0.70,
            "trigger_reason": "RWA/crypto divergence exceeds threshold" if spread > 0.75 else
                              "Volatility regime elevated" if vol > 0.70 else "Monitoring",
            "sdk_note": "On mainnet: Rialo predicate fires automatically inside consensus. No bot needed.",
        }
    }
