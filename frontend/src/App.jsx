import React, { useState, useEffect } from 'react'
import Topbar from './components/Layout/Topbar'
import SignalDashboard from './components/SignalDashboard/SignalDashboard'
import TokenIntel from './components/TokenIntel/TokenIntel'
import ClusterMap from './components/ClusterMap/ClusterMap'
import WalletAnalysis from './components/WalletAnalysis/WalletAnalysis'
import './styles/app.css'
import ARIA from './components/ARIA/ARIA'

/*
  APP.JSX — The Root Component
  ==============================
  This is the top-level component. It:
  1. Holds the active tab in state
  2. Renders the Topbar navigation
  3. Conditionally renders whichever panel is active

  Think of it as the "router" for our single-page app.
  We're using simple state instead of React Router
  because we only have 4 views and don't need URL routing for MVP.

  Data flow in React is always TOP → DOWN.
  App sits at the top. It passes data to children via "props."
  Children can't pass data up — they fire events (callbacks) instead.
*/

// The four main sections of Rialo Signal
const TABS = [
  { id: 'signals',  label: 'Signal Engine',      desc: 'Live RWA + Crypto signals' },
  { id: 'tokens',   label: 'Token Intelligence',  desc: 'Onchain-first token analysis' },
  { id: 'cluster',  label: 'Cluster Map',         desc: 'Whale + signal visualization' },
  { id: 'wallet',   label: 'Wallet Analysis',     desc: 'Deep wallet intelligence' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('signals')

  useEffect(() => {
    // Fire-and-forget warm-up ping so Render backend wakes before user interaction.
    // Render free tier sleeps after 15 min idle; cold start takes ~38s.
    const apiBase = import.meta.env.VITE_API_URL || '/api'
    fetch(`${apiBase}/prices/all`).catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      {/*
        Topbar receives tabs and the active tab as props,
        plus a callback to change the tab when user clicks.
        Props flow DOWN — callback fires UP.
      */}
      <Topbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="app-main">
        {/*
          Conditional rendering — only the active tab renders.
          The others are unmounted (removed from DOM entirely).
          This means their useEffect timers also stop — good for performance.
        */}
        {activeTab === 'signals' && <SignalDashboard />}
        {activeTab === 'tokens'  && <TokenIntel />}
        {activeTab === 'cluster' && <ClusterMap />}
        {activeTab === 'wallet'  && <WalletAnalysis />}
      </main>
          <ARIA />
    </div>
  )
}
