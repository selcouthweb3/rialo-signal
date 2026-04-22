import { useState, useCallback } from 'react'
import { fetchTokenIntelligence } from '../services/api'

/*
  CUSTOM HOOK: useToken
  ======================
  Unlike usePrices and useSignals, this hook doesn't auto-poll.
  It fetches ON DEMAND when the user selects a token.

  useCallback wraps the fetchToken function to prevent it
  from being recreated on every render — a performance optimization.
*/

export function useToken(initialSymbol = 'BTC') {
  const [symbol, setSymbol]   = useState(initialSymbol)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchToken = useCallback(async (sym) => {
    if (!sym) return
    const upperSym = sym.toUpperCase()
    setLoading(true)
    setError(null)
    setSymbol(upperSym)
    try {
      const data = await fetchTokenIntelligence(upperSym)
      setToken(data)
    } catch (err) {
      setError(`Token "${upperSym}" not found`)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { symbol, token, loading, error, fetchToken }
}
