import React from 'react'
import { usePrices } from '../../hooks/usePrices'
import './Topbar.css'

const PAGE_TITLES = {
  signals: 'Signal Engine',
  tokens:  'Token Intelligence',
  cluster: 'Cluster Map',
  wallet:  'Wallet Analysis',
}

export default function Topbar({ activePage }) {
  const { prices, loading } = usePrices(60000)
  const ethPrice = prices?.crypto?.ETH?.price

  return (
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
      </div>
    </header>
  )
}
