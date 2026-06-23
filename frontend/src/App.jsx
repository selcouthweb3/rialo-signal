import React, { useState, useEffect } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Topbar from './components/Layout/Topbar'
import SignalDashboard from './components/SignalDashboard/SignalDashboard'
import TokenIntel from './components/TokenIntel/TokenIntel'
import ClusterMap from './components/ClusterMap/ClusterMap'
import WalletAnalysis from './components/WalletAnalysis/WalletAnalysis'
import Watchlist from './components/Watchlist/Watchlist'
import ARIA from './components/ARIA/ARIA'
import { useWallet } from './context/WalletContext'
import './styles/app.css'

function ChainToast() {
  const { toast, dismissToast } = useWallet()
  if (!toast) return null
  return (
    <div className="chain-toast">
      <span>⚠ {toast}</span>
      <button className="chain-toast-close" onClick={dismissToast} aria-label="Dismiss">×</button>
    </div>
  )
}

export default function App() {
  const [activePage, setActivePage]             = useState('signals')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [walletInitAddr, setWalletInitAddr]     = useState(null)

  function goToWalletAnalysis(address) {
    setWalletInitAddr(address)
    setActivePage('wallet')
  }

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '/api'
    fetch(`${apiBase}/prices/all`).catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      <div className={`app-body${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar activePage={activePage} />
        <main className="app-main">
          {activePage === 'signals'   && <SignalDashboard />}
          {activePage === 'tokens'    && <TokenIntel />}
          {activePage === 'cluster'   && <ClusterMap />}
          {activePage === 'wallet'    && (
            <WalletAnalysis
              initialAddress={walletInitAddr}
              onInitConsumed={() => setWalletInitAddr(null)}
            />
          )}
          {activePage === 'watchlist' && (
            <Watchlist onAnalyse={goToWalletAnalysis} />
          )}
        </main>
      </div>

      <ARIA />
      <ChainToast />
    </div>
  )
}
