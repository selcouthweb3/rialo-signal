import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../context/WalletContext'
import ABI from '../contracts/WalletRegistry.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRY_CONTRACT

async function getContract(withSigner = false) {
  if (!CONTRACT_ADDRESS) throw new Error('VITE_REGISTRY_CONTRACT not configured')
  if (!window.ethereum)  throw new Error('No wallet detected')
  const provider = new ethers.BrowserProvider(window.ethereum)
  const runner   = withSigner ? await provider.getSigner() : provider
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, runner)
}

export function useWatchlist() {
  const { address, isConnected } = useWallet()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [toast, setToast]         = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const refreshWatchlist = useCallback(async () => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) {
      setWatchlist([])
      return
    }
    console.log('[useWatchlist] fetching from contract:', CONTRACT_ADDRESS, 'for', address)
    try {
      // Must use signer so eth_call includes from:address → msg.sender is set correctly
      const c    = await getContract(true)
      const list = await c.getWatchlist()
      console.log('[useWatchlist] got', list.length, 'entries:', list)
      setWatchlist(list.map(a => a.toLowerCase()))
    } catch (err) {
      console.warn('[useWatchlist] refreshWatchlist error:', err.message)
      setWatchlist([])
    }
  }, [address, isConnected])

  useEffect(() => { refreshWatchlist() }, [refreshWatchlist])

  function isWatching(walletAddress) {
    if (!walletAddress) return false
    return watchlist.includes(walletAddress.toLowerCase())
  }

  async function addWallet(walletAddress) {
    setLoading(true)
    setError(null)
    try {
      const c  = await getContract(true)
      const tx = await c.addWallet(walletAddress)
      await tx.wait()
      await refreshWatchlist()
      showToast('Added to onchain watchlist')
    } catch (err) {
      const msg = err.reason || err.shortMessage || err.message || 'Transaction failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function removeWallet(walletAddress) {
    setLoading(true)
    setError(null)
    try {
      const c  = await getContract(true)
      const tx = await c.removeWallet(walletAddress)
      await tx.wait()
      await refreshWatchlist()
      showToast('Removed from watchlist')
    } catch (err) {
      const msg = err.reason || err.shortMessage || err.message || 'Transaction failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    watchlist,
    isWatching,
    loading,
    error,
    toast,
    addWallet,
    removeWallet,
    refreshWatchlist,
    contractReady: Boolean(CONTRACT_ADDRESS),
  }
}
