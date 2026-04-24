from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
load_dotenv()

from app.routes import prices, signals, tokens, wallet, rialo, chat
from app.services.cache import cache

app = FastAPI(
    title="Rialo Signal API",
    description="Onchain intelligence terminal for the Rialo ecosystem",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prices.router, prefix="/api/prices", tags=["Prices"])
app.include_router(signals.router, prefix="/api/signals", tags=["Signals"])
app.include_router(tokens.router, prefix="/api/tokens", tags=["Tokens"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(rialo.router, prefix="/api/rialo", tags=["Rialo SDK"])
app.include_router(chat.router, prefix="/api/chat", tags=["ARIA"])

@app.get("/")
def root():
    return {
        "app": "Rialo Signal",
        "version": "0.1.0",
        "status": "live",
        "rialo_sdk": "ready — awaiting mainnet"
    }

@app.get("/health")
def health():
    return {"status": "ok", "cache_size": len(cache.store)}
