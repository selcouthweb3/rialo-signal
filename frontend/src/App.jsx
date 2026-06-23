import React, { useState, useEffect } from 'react'
import Sidebar from './components/Layout/Sidebar'
import Topbar from './components/Layout/Topbar'
import SignalDashboard from './components/SignalDashboard/SignalDashboard'
import TokenIntel from './components/TokenIntel/TokenIntel'
import ClusterMap from './components/ClusterMap/ClusterMap'
import WalletAnalysis from './components/WalletAnalysis/WalletAnalysis'
import ARIA from './components/ARIA/ARIA'
import './styles/app.css'

export default function App() {
  const [activePage, setActivePage]             = useState('signals')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
          {activePage === 'signals' && <SignalDashboard />}
          {activePage === 'tokens'  && <TokenIntel />}
          {activePage === 'cluster' && <ClusterMap />}
          {activePage === 'wallet'  && <WalletAnalysis />}
        </main>
      </div>

      <ARIA />
    </div>
  )
}
