import { useState, useCallback } from 'react'
import { fetchWalletV2 } from '../services/api'

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/

export function useWalletV2() {
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [retrying,    setRetrying]    = useState(false)
  const [isRetryable, setIsRetryable] = useState(false)

  const fetch = useCallback(async (address) => {
    const addr = (address || '').trim()

    if (!ADDR_RE.test(addr)) {
      setError('Please enter a valid Ethereum address (0x followed by 40 hex characters)')
      setIsRetryable(false)
      setData(null)
      return
    }

    setLoading(true)
    setRetrying(false)
    setIsRetryable(false)
    setError(null)
    setData(null)

    try {
      const result = await fetchWalletV2(addr)
      setData(result)
    } catch (err) {
      setRetrying(true)
      await new Promise(r => setTimeout(r, 2500))
      try {
        const result = await fetchWalletV2(addr)
        setData(result)
      } catch (err2) {
        const status = err2?.response?.status
        if (status === 429) {
          setError('Rate limit reached. Try again in a moment.')
          setIsRetryable(false)
        } else if (status === 400) {
          setError('Please enter a valid Ethereum address (0x followed by 40 hex characters)')
          setIsRetryable(false)
        } else {
          setError("Couldn't reach the analysis service. The backend may be starting up.")
          setIsRetryable(true)
        }
      }
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }, [])

  return { data, loading, error, retrying, isRetryable, fetch }
}
