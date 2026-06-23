# Mirror of CEX_ENTITIES from frontend/src/components/ClusterMap/entities.js
# Only CEX entities have real on-chain addresses suitable for matching.
# Keys are lowercase addresses for case-insensitive lookup.

KNOWN_ENTITIES = {
    "0x28c6c06298d514db089934071355e5743bf21d60": {
        "label": "Binance 14",
        "category": "cex",
        "notes": "Largest CEX hot wallet by on-chain holdings",
    },
    "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": {
        "label": "Coinbase Prime",
        "category": "cex",
        "notes": "Institutional custody and prime brokerage wallet",
    },
    "0xf89d7b9c864f589bbf53a82105107622b35eaa40": {
        "label": "Bybit",
        "category": "cex",
        "notes": "Primary Bybit exchange hot wallet",
    },
    "0xa7efae728d2936e78bda97dc267687568dd593f3": {
        "label": "OKX",
        "category": "cex",
        "notes": "OKX main funding wallet",
    },
    "0x2910543af39aba0cd09dbb2d50200b3e800a63d2": {
        "label": "Kraken",
        "category": "cex",
        "notes": "Kraken primary hot wallet",
    },
    "0x2b5634c42055806a59e9107ed44d43c426e58258": {
        "label": "KuCoin",
        "category": "cex",
        "notes": "KuCoin exchange wallet",
    },
    "0x6262998ced04146fa42253a5c0af90ca02dfd2a3": {
        "label": "Crypto.com",
        "category": "cex",
        "notes": "Crypto.com exchange cold wallet",
    },
    "0x1151314c646ce4e0efd76d1af4760ae66a9fe30f": {
        "label": "Bitfinex",
        "category": "cex",
        "notes": "Bitfinex exchange wallet",
    },
    "0x0d0707963952f2fba59dd06f2b425ace40b492fe": {
        "label": "Gate.io",
        "category": "cex",
        "notes": "Gate.io main exchange wallet",
    },
    "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88": {
        "label": "MEXC",
        "category": "cex",
        "notes": "MEXC exchange hot wallet",
    },
}

# Hardcoded famous ENS names for well-known addresses (MVP substitute for live ENS lookup)
FAMOUS_ENS = {
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "vitalik.eth",
    "0xab5801a7d398351b8be11c439e05c5b3259aec9b": "vitalik.eth",
}
