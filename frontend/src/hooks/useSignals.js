import { useState, useEffect, useRef } from 'react'
import { fetchLiveSignals } from '../services/api'

/*
  CUSTOM HOOK: useSignals
  ========================
  Fetches the 5 signal scores + risk from the backend.
  Updates every 8 seconds (slower than prices — signals don't
  need to update as fast and this reduces backend load).
*/

const FALLBACK_SIGNALS = {
  signals: {
    volatility_regime:     0.72,
    rwa_crypto_divergence: 0.81,
    momentum:              0.65,
    liquidity_score:       0.58,
    yield_divergence:      0.77,
  },
  risk: { score: 65, label: 'Elevated', color: 'warning' },
  correlation_index: 0.48,
  pump_signals: [
    { signal: 'Short liquidation cascade', strength: 0.91, direction: 'catalyst',  description: 'Forced short covers amplifying move' },
    { signal: 'Whale accumulation',        strength: 0.82, direction: 'bullish',   description: 'Large wallets adding positions' },
    { signal: 'Exchange inflow drop',      strength: 0.74, direction: 'bullish',   description: 'Supply leaving exchanges' },
    { signal: 'Yield divergence',          strength: 0.67, direction: 'bearish',   description: 'Bond/crypto decoupling active' },
    { signal: 'Social sentiment spike',    strength: 0.65, direction: 'bullish',   description: 'Social volume surge' },
    { signal: 'Volume spike',              strength: 0.44, direction: 'neutral',   description: 'Abnormal volume vs 30d avg' },
  ],
  rialo_reactive_tx: {
    armed: true,
    trigger_reason: 'RWA/crypto divergence exceeds threshold',
    sdk_note: 'On mainnet: Rialo predicate fires automatically. No bot needed.',
  },
  timestamp: Date.now() / 1000,
}

export function useSignals(intervalMs = 8000) {
  const [signals, setSignals] = useState(FALLBACK_SIGNALS)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const loadSignals = async () => {
    try {
      const data = await fetchLiveSignals()
      if (data && data.signals) {
        setSignals(data)
      }
    } catch {
      // Silent fail — keep showing last known signals
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSignals()
    timerRef.current = setInterval(loadSignals, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [intervalMs])

  return { signals, loading }
}
