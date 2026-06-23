import asyncio
import os
import re
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from app.data.entities import FAMOUS_ENS, KNOWN_ENTITIES
from app.services.cache import cache

router = APIRouter()

ETHERSCAN_BASE = "https://api.etherscan.io/v2/api"
ETHERSCAN_CHAIN = "1"  # Ethereum mainnet
ADDR_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")

ERC20_TOKENS = [
    {"symbol": "USDC", "contract": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "decimals": 6},
    {"symbol": "USDT", "contract": "0xdAC17F958D2ee523a2206206994597C13D831ec7", "decimals": 6},
    {"symbol": "DAI",  "contract": "0x6B175474E89094C44Da98b954EedeAC495271d0F", "decimals": 18},
    {"symbol": "WETH", "contract": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "decimals": 18},
    {"symbol": "WBTC", "contract": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", "decimals": 8},
    {"symbol": "LINK", "contract": "0x514910771AF9Ca656af840dff83E8264EcF986CA", "decimals": 18},
    {"symbol": "UNI",  "contract": "0x1f9840a85d5aF5bf1D1762F925BdADdC4201F984", "decimals": 18},
]

STABLECOIN_SYMS = {"USDC", "USDT", "DAI"}


async def _es(client: httpx.AsyncClient, params: dict, api_key: str) -> dict:
    """Single Etherscan V2 API call with error isolation."""
    try:
        resp = await client.get(
            ETHERSCAN_BASE,
            params={"chainid": ETHERSCAN_CHAIN, "apikey": api_key, **params},
            timeout=10.0,
        )
        return resp.json()
    except Exception as exc:
        return {"status": "0", "result": None, "_error": str(exc)}


def _parse_tx_list(raw) -> list:
    return raw if isinstance(raw, list) else []


def _parse_method(tx: dict) -> str:
    fn = tx.get("functionName", "")
    if fn:
        return fn.split("(")[0].strip() or "call"
    method_id = tx.get("methodId", "0x")
    if method_id and method_id != "0x":
        return method_id[:10]
    return "ETH transfer"


def _check_rate_limit(*resps) -> bool:
    for r in resps:
        result = r.get("result")
        if isinstance(result, str) and "rate limit" in result.lower():
            return True
    return False


@router.get("/{address}")
async def get_wallet_v2(address: str):
    if not ADDR_RE.match(address):
        raise HTTPException(
            status_code=400,
            detail="Invalid Ethereum address. Expected 0x followed by 40 hex characters.",
        )

    addr_lower = address.lower()
    cache_key = f"wallet_v2_{addr_lower}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    api_key = os.environ.get("ETHERSCAN_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="Etherscan API key not configured.")

    async with httpx.AsyncClient(timeout=12.0) as client:
        # ── Batch 1: balance, price, recent txs, oldest tx, nonce ────────
        (
            balance_r,
            price_r,
            txs_r,
            first_tx_r,
            nonce_r,
        ) = await asyncio.gather(
            _es(client, {"module": "account", "action": "balance",
                         "address": address, "tag": "latest"}, api_key),
            _es(client, {"module": "stats", "action": "ethprice"}, api_key),
            _es(client, {"module": "account", "action": "txlist",
                         "address": address, "page": "1", "offset": "10", "sort": "desc"}, api_key),
            _es(client, {"module": "account", "action": "txlist",
                         "address": address, "page": "1", "offset": "1", "sort": "asc"}, api_key),
            _es(client, {"module": "proxy", "action": "eth_getTransactionCount",
                         "address": address, "tag": "latest"}, api_key),
        )

        if _check_rate_limit(balance_r, price_r, txs_r):
            raise HTTPException(status_code=429,
                                detail="Etherscan rate limit reached. Try again in a moment.")

        # Small pause before token batch (free tier: 5 req/sec)
        await asyncio.sleep(0.25)

        # ── Batch 2: 7 token balances ─────────────────────────────────────
        token_resps = await asyncio.gather(*[
            _es(client, {
                "module": "account", "action": "tokenbalance",
                "contractaddress": t["contract"],
                "address": address, "tag": "latest",
            }, api_key)
            for t in ERC20_TOKENS
        ])

    # ── Parse ETH balance ─────────────────────────────────────────────────
    try:
        eth_wei = int(balance_r.get("result") or 0)
    except (ValueError, TypeError):
        eth_wei = 0
    eth_balance = eth_wei / 1e18

    # ── Parse ETH price ───────────────────────────────────────────────────
    price_data = price_r.get("result") or {}
    try:
        eth_price_usd = float(price_data.get("ethusd", 0))
    except (ValueError, TypeError):
        eth_price_usd = 0.0
    eth_value_usd = eth_balance * eth_price_usd

    # ── Parse nonce (outgoing tx count proxy) ─────────────────────────────
    nonce_hex = nonce_r.get("result")
    try:
        total_txs = int(nonce_hex, 16) if nonce_hex else None
    except (ValueError, TypeError):
        total_txs = None

    # ── Parse transactions ────────────────────────────────────────────────
    txs_raw = _parse_tx_list(txs_r.get("result"))
    first_tx_raw = _parse_tx_list(first_tx_r.get("result"))

    recent_transactions = []
    for tx in txs_raw[:10]:
        try:
            val_eth = int(tx.get("value", 0)) / 1e18
        except (ValueError, TypeError):
            val_eth = 0.0
        recent_transactions.append({
            "hash":      tx.get("hash", ""),
            "from":      tx.get("from", ""),
            "to":        tx.get("to", ""),
            "value_eth": round(val_eth, 6),
            "value_usd": round(val_eth * eth_price_usd, 2),
            "timestamp": int(tx.get("timeStamp", 0)),
            "method":    _parse_method(tx),
            "is_error":  tx.get("isError") == "1",
        })

    last_tx_ts  = int(txs_raw[0].get("timeStamp", 0)) if txs_raw else None
    first_tx_ts = int(first_tx_raw[0].get("timeStamp", 0)) if first_tx_raw else None

    # Empty wallet check
    if not txs_raw and eth_balance == 0:
        empty_result = {
            "address": address,
            "ens_name": None,
            "entity_label": None,
            "entity_category": None,
            "entity_notes": None,
            "eth_balance": 0.0,
            "eth_value_usd": 0.0,
            "eth_price_usd": round(eth_price_usd, 2),
            "total_value_usd": 0.0,
            "total_txs": 0,
            "first_tx_timestamp": None,
            "last_tx_timestamp": None,
            "recent_transactions": [],
            "erc20_holdings": [],
            "note": "This address has no on-chain activity yet.",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
        cache.set(cache_key, empty_result, ttl=60)
        return empty_result

    # ── Parse ERC20 balances ──────────────────────────────────────────────
    erc20_holdings = []
    total_token_usd = 0.0

    for i, token in enumerate(ERC20_TOKENS):
        raw_bal = token_resps[i].get("result") or "0"
        if not isinstance(raw_bal, str):
            raw_bal = "0"
        try:
            balance = int(raw_bal) / (10 ** token["decimals"])
        except (ValueError, TypeError):
            balance = 0.0

        if balance <= 0:
            continue

        if token["symbol"] in STABLECOIN_SYMS:
            value_usd = balance
        elif token["symbol"] == "WETH":
            value_usd = balance * eth_price_usd
        else:
            value_usd = 0.0  # non-stablecoin, non-ETH: price feed would need CoinGecko

        total_token_usd += value_usd
        erc20_holdings.append({
            "symbol":    token["symbol"],
            "balance":   round(balance, 6),
            "value_usd": round(value_usd, 2),
        })

    erc20_holdings.sort(key=lambda h: h["value_usd"], reverse=True)
    total_value_usd = eth_value_usd + total_token_usd

    # ── Entity and ENS lookup ─────────────────────────────────────────────
    entity   = KNOWN_ENTITIES.get(addr_lower)
    ens_name = FAMOUS_ENS.get(addr_lower)

    result = {
        "address":           address,
        "ens_name":          ens_name,
        "entity_label":      entity["label"]    if entity else None,
        "entity_category":   entity["category"] if entity else None,
        "entity_notes":      entity["notes"]    if entity else None,
        "eth_balance":       round(eth_balance, 6),
        "eth_value_usd":     round(eth_value_usd, 2),
        "eth_price_usd":     round(eth_price_usd, 2),
        "total_value_usd":   round(total_value_usd, 2),
        "total_txs":         total_txs,
        "first_tx_timestamp": first_tx_ts,
        "last_tx_timestamp":  last_tx_ts,
        "recent_transactions": recent_transactions,
        "erc20_holdings":    erc20_holdings,
        "fetched_at":        datetime.now(timezone.utc).isoformat(),
    }

    cache.set(cache_key, result, ttl=60)
    return result
