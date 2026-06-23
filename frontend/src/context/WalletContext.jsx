import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const WalletContext = createContext(null)

const LS_KEY = 'rialo_connected_wallet'

export function WalletProvider({ children }) {
  const [address, setAddress]     = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError]         = useState(null)
  const [toast, setToast]         = useState(null)
  const toastTimer = useRef(null)

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 6000)
  }

  function dismissToast() {
    setToast(null)
    clearTimeout(toastTimer.current)
  }

  // Restore saved address on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) setAddress(saved)
  }, [])

  // MetaMask event listeners
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return

    function onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        setAddress(null)
        localStorage.removeItem(LS_KEY)
      } else {
        const addr = accounts[0]
        setAddress(addr)
        localStorage.setItem(LS_KEY, addr)
      }
    }

    function onChainChanged(chainId) {
      if (parseInt(chainId, 16) !== 1) {
        showToast('Switch to Ethereum Mainnet for best results')
      }
    }

    window.ethereum.on('accountsChanged', onAccountsChanged)
    window.ethereum.on('chainChanged', onChainChanged)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum.removeListener('chainChanged', onChainChanged)
    }
  }, [])

  async function connect() {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed')
      throw new Error('MetaMask not installed')
    }
    setConnecting(true)
    setError(null)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      setAddress(addr)
      localStorage.setItem(LS_KEY, addr)
      return addr
    } catch {
      setError('Connection rejected')
      throw new Error('Connection rejected')
    } finally {
      setConnecting(false)
    }
  }

  function disconnect() {
    setAddress(null)
    localStorage.removeItem(LS_KEY)
  }

  return (
    <WalletContext.Provider value={{
      address,
      isConnected: Boolean(address),
      connecting,
      error,
      setError,
      toast,
      dismissToast,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
