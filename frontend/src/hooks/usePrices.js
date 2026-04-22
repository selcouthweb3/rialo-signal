import { useState, useEffect, useRef } from 'react'
import { fetchAllPrices } from '../services/api'

const FALLBACK_PRICES = {
  crypto: {
    BTC:  { symbol: 'BTC',  price: 75000, change_24h: -0.84, type: 'crypto' },
    ETH:  { symbol: 'ETH',  price: 1580,  change_24h: -2.24, type: 'crypto' },
    SOL:  { symbol: 'SOL',  price: 120,   change_24h: -1.12, type: 'crypto' },
    BNB:  { symbol: 'BNB',  price: 595,   change_24h: -1.56, type: 'crypto' },
    AVAX: { symbol: 'AVAX', price: 18.9,  change_24h: -1.75, type: 'crypto' },
  },
  rwa: {
    US10Y: { symbol: 'US10Y', name: 'US 10Y Treasury', price: 4.40,  change_24h: -0.3 },
    GOLD:  { symbol: 'GOLD',  name: 'Gold Spot',        price: 3314,  change_24h: 0.8  },
    SPX:   { symbol: 'SPX',   name: 'S&P 500',          price: 5282,  change_24h: 0.5  },
    OIL:   { symbol: 'OIL',   name: 'Crude Oil',        price: 64.1,  change_24h: -0.8 },
  }
}

export function usePrices(intervalMs = 60000) {
  const [prices, setPrices]   = useState(FALLBACK_PRICES)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const loadPrices = async () => {
    try {
      const data = await fetchAllPrices()
      if (data && data.crypto && Object.keys(data.crypto).length > 0) {
        setPrices(data)
      }
    } catch (err) {
      // Keep showing last known prices — no crash
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrices()
    timerRef.current = setInterval(loadPrices, intervalMs)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [intervalMs])

  return { prices, loading, refetch: loadPrices }
}
