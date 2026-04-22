import hashlib
import time
import math
import random
from typing import Dict, Any

KNOWN_WALLETS = {
    "0x3f8ad91c": {"type": "mega_whale", "label": "Mega Whale", "smart_money": False, "known": True},
    "0xb72e4401": {"type": "exchange",   "label": "Exchange Cold Wallet", "smart_money": False, "known": True},
    "0x91fcaa37": {"type": "smart",      "label": "Smart Money",  "smart_money": True,  "known": True},
    "0x2d44f8e2": {"type": "smart",      "label": "Smart Money",  "smart_money": True,  "known": True},
    "0xe5c13309": {"type": "vc",         "label": "VC / Fund",    "smart_money": False, "known": True},
}

WALLET_TYPES = ["mega_whale", "exchange", "smart", "vc", "retail", "bot"]
TYPE_LABELS  = {
    "mega_whale": "Mega Whale",
    "exchange":   "Exchange Wallet",
    "smart":      "Smart Money",
    "vc":         "VC / Fund",
    "retail":     "Retail",
    "bot":        "Bot / Automated",
}
TYPE_COLORS = {
    "mega_whale": "#ef4444",
    "exchange":   "#f59e0b",
    "smart":      "#7B6EF6",
    "vc":         "#38bdf8",
    "retail":     "#00e5b4",
    "bot":        "#888780",
}

def _seed(address: str) -> float:
    h = int(hashlib.md5(address.encode()).hexdigest(), 16)
    return (h % 10000) / 10000.0

def classify_wallet(address: str) -> dict:
    """
    Classify wallet type from address.
    MVP: deterministic simulation based on address hash.
    SDK point: replace with Rialo Read Path validator state.
    """
    short = address.lower().replace("0x", "")[:8]
    for known_key, data in KNOWN_WALLETS.items():
        if known_key.replace("0x", "") in short:
            return data

    s = _seed(address)
    if s < 0.05:   wtype = "mega_whale"
    elif s < 0.15: wtype = "exchange"
    elif s < 0.32: wtype = "smart"
    elif s < 0.42: wtype = "vc"
    elif s < 0.92: wtype = "retail"
    else:          wtype = "bot"

    return {
        "type": wtype,
        "label": TYPE_LABELS[wtype],
        "smart_money": wtype == "smart",
        "known": False,
    }

def get_wallet_holdings(address: str) -> list[dict]:
    """
    Simulate wallet token holdings.
    SDK point: Rialo Read Path delivers this from validators.
    """
    s = _seed(address)
    t = time.time()

    holding_count = max(2, int(s * 8) + 1)
    tokens = ["BTC", "ETH", "SOL", "USDC", "USDT", "BNB", "AVAX", "LINK"]
    random.seed(int(s * 99999))
    selected = random.sample(tokens, min(holding_count, len(tokens)))

    holdings = []
    for i, token in enumerate(selected):
        seed2 = _seed(address + token)
        value = seed2 * 500000 + 1000
        pct_change = math.sin(t * 0.001 + seed2 * 10) * 3.0
        holdings.append({
            "token": token,
            "value_usd": round(value, 2),
            "pct_24h": round(pct_change, 2),
            "rwa_correlated": token in ["BTC", "ETH"],
        })

    holdings.sort(key=lambda x: x["value_usd"], reverse=True)
    return holdings

def compute_behaviour_score(address: str) -> dict:
    """
    Score wallet behaviour: accumulating, distributing, or dormant.
    0-100. High = accumulating. Low = distributing.
    """
    s = _seed(address)
    t = time.time()
    score = 30 + s * 60 + math.sin(t * 0.0008 + s * 5) * 15
    score = round(min(99, max(1, score)), 1)

    if score >= 65:   behaviour = "Accumulating"
    elif score >= 40: behaviour = "Neutral"
    else:             behaviour = "Distributing"

    return {"score": score, "behaviour": behaviour}

def get_smart_money_correlation(address: str) -> dict:
    """
    How correlated is this wallet with known smart money?
    High correlation = wallet likely has informed positioning.
    """
    s = _seed(address)
    corr = round(s * 0.95, 3)
    lead_time_hours = int(s * 18)

    return {
        "correlation": corr,
        "lead_time_hours": lead_time_hours,
        "description": f"Moves {lead_time_hours}h before price on average" if corr > 0.5 else "No significant lead time detected"
    }

def get_rwa_exposure(holdings: list[dict]) -> dict:
    """
    Calculate RWA vs crypto exposure of wallet.
    Unique to Rialo Signal — no other terminal shows this.
    """
    total = sum(h["value_usd"] for h in holdings)
    if total == 0:
        return {"rwa_pct": 0, "crypto_pct": 0, "stablecoin_pct": 0}

    stable = sum(h["value_usd"] for h in holdings if h["token"] in ["USDC", "USDT"])
    rwa_corr = sum(h["value_usd"] for h in holdings if h.get("rwa_correlated"))
    crypto = total - stable - rwa_corr

    return {
        "rwa_correlated_pct": round(rwa_corr / total * 100, 1),
        "crypto_pct":         round(crypto / total * 100, 1),
        "stablecoin_pct":     round(stable / total * 100, 1),
        "total_value_usd":    round(total, 2),
    }

def get_rialo_predicates(address: str, holdings: list[dict]) -> list[dict]:
    """
    Suggest reactive TX predicates for this wallet.
    SDK point: these would be deployed onchain as Rialo predicates.
    No bot needed — fires inside consensus.
    """
    predicates = []
    s = _seed(address)
    total = sum(h["value_usd"] for h in holdings)

    predicates.append({
        "predicate": f"If wallet moves >5% of holdings",
        "action": "Trigger PRISM alert + portfolio rebalance signal",
        "status": "sdk_ready",
        "threshold": "5%",
    })
    if total > 50000:
        predicates.append({
            "predicate": "If whale accumulates >$50k in 1h",
            "action": "Fire smart money signal to all PRISM subscribers",
            "status": "sdk_ready",
            "threshold": "$50,000",
        })
    predicates.append({
        "predicate": "Monitor for exchange deposit pattern",
        "action": "Bearish signal — wallet preparing to sell",
        "status": "sdk_ready",
        "threshold": "Pattern match",
    })

    return predicates

def get_onchain_activity(address: str) -> list[dict]:
    """
    Simulated recent transaction history.
    SDK point: Rialo Read Path delivers real tx data from validators.
    """
    s = _seed(address)
    t = time.time()
    activities = []
    tx_types = ["BUY", "SELL", "SWAP", "TRANSFER", "LIQ+"]
    tokens = ["BTC", "ETH", "SOL", "USDC", "BNB"]

    random.seed(int(s * 12345 + t // 300))
    for i in range(8):
        seed_i = _seed(address + str(i))
        tx_type = tx_types[int(seed_i * len(tx_types))]
        token = tokens[int(seed_i * len(tokens))]
        value = round(seed_i * 200000 + 500, 2)
        minutes_ago = int(seed_i * 120) + i * 15

        activities.append({
            "type": tx_type,
            "token": token,
            "value_usd": value,
            "time_ago": f"{minutes_ago}m ago" if minutes_ago < 60 else f"{minutes_ago // 60}h ago",
            "hash": "0x" + hashlib.md5(f"{address}{i}".encode()).hexdigest()[:12] + "...",
        })

    return activities

def analyze_wallet(address: str) -> Dict[str, Any]:
    """
    Full wallet analysis — main entry point.
    Called by /api/wallet/{address}
    """
    if not address or len(address) < 6:
        return {"error": "Invalid address"}

    classification  = classify_wallet(address)
    holdings        = get_wallet_holdings(address)
    behaviour       = compute_behaviour_score(address)
    smart_corr      = get_smart_money_correlation(address)
    rwa_exposure    = get_rwa_exposure(holdings)
    predicates      = get_rialo_predicates(address, holdings)
    activity        = get_onchain_activity(address)

    spam_score = _seed(address + "spam")
    scam_risk = "Low" if spam_score < 0.85 else "High"

    return {
        "address": address,
        "classification": classification,
        "colour": TYPE_COLORS.get(classification["type"], "#888780"),
        "behaviour": behaviour,
        "smart_money_correlation": smart_corr,
        "rwa_exposure": rwa_exposure,
        "holdings": holdings,
        "recent_activity": activity,
        "rialo_predicates": predicates,
        "scam_risk": scam_risk,
        "spam_score": round(spam_score, 3),
        "rialo_sdk_note": "On mainnet: Rialo Read Path delivers all wallet state directly from validators. No Etherscan, no indexer.",
        "timestamp": round(time.time(), 2),
    }
