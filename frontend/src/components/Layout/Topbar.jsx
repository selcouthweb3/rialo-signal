import React, { useState, useRef, useEffect } from 'react'
import { Wallet, ChevronDown } from 'lucide-react'
import { usePrices } from '../../hooks/usePrices'
import { useWallet } from '../../context/WalletContext'
import WalletModal from '../Wallet/WalletModal'
import './Topbar.css'

const PAGE_TITLES = {
  signals: 'Signal Engine',
  tokens:  'Token Intelligence',
  cluster: 'Cluster Map',
  wallet:  'Wallet Analysis',
}

function truncAddr(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function ConnectedAddress({ address, disconnect }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <div className="wallet-connected" ref={wrapRef}>
      <button
        className="wallet-addr-btn"
        onClick={() => setDropdownOpen(d => !d)}
        aria-label="Wallet options"
        aria-expanded={dropdownOpen}
      >
        <span className="wallet-dot" />
        <span className="wallet-addr-text">{truncAddr(address)}</span>
        <ChevronDown size={12} strokeWidth={2} className={dropdownOpen ? 'chevron-open' : ''} />
      </button>

      {dropdownOpen && (
        <div className="wallet-dropdown">
          <div className="wallet-dropdown-addr">{truncAddr(address)}</div>
          <button
            className="wallet-disconnect-btn"
            onClick={() => { disconnect(); setDropdownOpen(false) }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}

export default function Topbar({ activePage }) {
  const { prices, loading } = usePrices(60000)
  const { address, isConnected, disconnect } = useWallet()
  const [modalOpen, setModalOpen] = useState(false)

  const ethPrice = prices?.crypto?.ETH?.price

  return (
    <>
      <header className="app-header">
        <h1 className="app-header-title">{PAGE_TITLES[activePage] || activePage}</h1>

        <div className="app-header-right">
          {!loading && ethPrice && (
            <span className="pill pill-sdk app-header-price">
              ETH&nbsp;
              <span className="app-header-price-val">
                ${ethPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </span>
          )}

          <span className="app-header-status">
            <span className="app-header-dot" />
            API Live
          </span>

          {isConnected
            ? <ConnectedAddress address={address} disconnect={disconnect} />
            : (
              <button
                className="wallet-connect-btn"
                onClick={() => setModalOpen(true)}
              >
                <Wallet size={13} strokeWidth={1.8} />
                Connect Wallet
              </button>
            )
          }
        </div>
      </header>

      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
