from fastapi import APIRouter
from pydantic import BaseModel
from app.services.coingecko import fetch_crypto_prices
from app.services.rwa_service import get_rwa_prices
from app.services.signal_engine import generate_live_signals
import httpx
import os

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    wallet: str = ""

ARIA_SYSTEM_PROMPT = """You are ARIA, the AI assistant for Rialo Signal, an onchain intelligence terminal built for the Rialo ecosystem. You are an expert in crypto markets, real-world assets, the Rialo blockchain protocol, DeFi, onchain analytics, whale tracking, and portfolio risk management. You explain complex things simply and always connect answers back to how Rialo solves the problem. Keep responses under 150 words. Respond in natural sentences, never bullet points. You know these Rialo primitives deeply: Reactive Transactions fire automatically inside consensus with zero bots needed. Rialo Edge enables Web2 API calls natively onchain. Rialo Stream delivers data feeds 40x faster than oracles with no oracle tax. Rialo Read Path cuts validator state latency to 100ms saving over 3000 dollars per month vs indexers. Stake-for-Service routes staking yield to pay for gas and reactive transactions automatically. Rialo IPC handles identity and privacy at the base layer using threshold MPC."""

@router.post("/")
async def chat(body: ChatMessage):
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return {"response": "ARIA is not configured. Please add your Groq API key."}
    try:
        crypto = await fetch_crypto_prices(["BTC", "ETH", "SOL", "BNB", "AVAX"])
        rwa = get_rwa_prices()
        signals = generate_live_signals(crypto, rwa)
        context = f"""Current market context:
BTC: ${crypto.get("BTC", {}).get("price", 0):,.0f} ({crypto.get("BTC", {}).get("change_24h", 0):+.2f}%)
ETH: ${crypto.get("ETH", {}).get("price", 0):,.0f} ({crypto.get("ETH", {}).get("change_24h", 0):+.2f}%)
SOL: ${crypto.get("SOL", {}).get("price", 0):,.2f} ({crypto.get("SOL", {}).get("change_24h", 0):+.2f}%)
Gold: ${rwa.get("GOLD", {}).get("price", 0):,.0f}
S&P 500: ${rwa.get("SPX", {}).get("price", 0):,.0f}
US 10Y Treasury: {rwa.get("US10Y", {}).get("price", 0):.2f}%
Crude Oil: ${rwa.get("OIL", {}).get("price", 0):,.2f}
Portfolio Risk Score: {signals["risk"]["score"]}/100 ({signals["risk"]["label"]})
Volatility Regime: {signals["signals"]["volatility_regime"]}
RWA/Crypto Divergence: {signals["signals"]["rwa_crypto_divergence"]}
Momentum: {signals["signals"]["momentum"]}
Liquidity Score: {signals["signals"]["liquidity_score"]}
Yield Divergence: {signals["signals"]["yield_divergence"]}
Reactive TX Armed: {signals["rialo_reactive_tx"]["armed"]}
{f"Wallet being analyzed: {body.wallet}" if body.wallet else ""}"""
        messages = [
            {"role": "system", "content": ARIA_SYSTEM_PROMPT},
            {"role": "user", "content": f"{context}\n\nUser question: {body.message}"}
        ]
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "max_tokens": 300,
                    "messages": messages
                }
            )
            data = resp.json()
            response_text = data["choices"][0]["message"]["content"]
        return {"response": response_text}
    except Exception as e:
        print(f"ARIA error: {e}")
        return {"response": "I encountered an error analyzing the current data. Please try again."}
