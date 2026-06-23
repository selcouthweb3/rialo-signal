import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../context/WalletContext'
import ABI from '../contracts/SignalStaking.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT
const MIN_STAKE_WEI    = ethers.parseEther('0.001')

async function getContract(withSigner = false) {
  if (!CONTRACT_ADDRESS) throw new Error('VITE_STAKING_CONTRACT not configured')
  if (!window.ethereum)  throw new Error('No wallet detected')
  const provider = new ethers.BrowserProvider(window.ethereum)
  const runner   = withSigner ? await provider.getSigner() : provider
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, runner)
}

export function useStaking() {
  const { address, isConnected } = useWallet()
  const [stakeWei, setStakeWei] = useState(0n)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [toast, setToast]       = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const refreshStake = useCallback(async () => {
    if (!isConnected || !address || !CONTRACT_ADDRESS) return
    try {
      const c      = await getContract(false)
      const amount = await c.getStake(address)
      setStakeWei(amount)
    } catch {
      // Not deployed yet — keep at 0n
    }
  }, [address, isConnected])

  useEffect(() => { refreshStake() }, [refreshStake])

  async function stake(amountEth) {
    setLoading(true)
    setError(null)
    try {
      const c  = await getContract(true)
      const tx = await c.stake({ value: ethers.parseEther(String(amountEth)) })
      await tx.wait()
      await refreshStake()
      showToast('Staked successfully — Premium unlocked!')
    } catch (err) {
      const msg = err.reason || err.shortMessage || err.message || 'Transaction failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function unstake() {
    setLoading(true)
    setError(null)
    try {
      const c  = await getContract(true)
      const tx = await c.unstake()
      await tx.wait()
      await refreshStake()
      showToast('Unstaked — returned to Free Tier')
    } catch (err) {
      const msg = err.reason || err.shortMessage || err.message || 'Transaction failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    stakeWei,
    stakeEth:   Number(ethers.formatEther(stakeWei)),
    isPremium:  stakeWei >= MIN_STAKE_WEI,
    loading,
    error,
    toast,
    stake,
    unstake,
    refreshStake,
    contractReady: Boolean(CONTRACT_ADDRESS),
  }
}
