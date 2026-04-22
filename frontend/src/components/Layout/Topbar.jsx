import React from 'react'
import './Topbar.css'

/*
  TOPBAR COMPONENT
  =================
  The fixed navigation bar at the top of the app.
  
  Props:
    - tabs: array of { id, label, desc }
    - activeTab: string — which tab is currently selected
    - onTabChange: function — called when user clicks a tab
  
  This component is "dumb" — it only displays what it's given.
  It has no state of its own. This is called a "presentational component."
*/

export default function Topbar({ tabs, activeTab, onTabChange }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">

        {/* Brand / Logo */}
        <div className="topbar-brand">
          <span className="brand-name">
            Rialo <span className="brand-accent">Signal</span>
          </span>
          <span className="brand-sub">Onchain Intelligence Terminal</span>
        </div>

        {/* Tab navigation */}
        <nav className="topbar-nav">
          {/*
            tabs.map() loops over the TABS array from App.jsx
            and creates a button for each one.
            
            The "key" prop is required by React when rendering lists.
            It helps React track which items changed.
          */}
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              title={tab.desc}   /* Tooltip on hover */
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Status indicators */}
        <div className="topbar-status">
          <span className="pill pill-live">
            <span className="dot-pulse"></span>
            Live
          </span>
          <span className="pill pill-sdk">
            <span className="dot-pulse" style={{ animationDuration: '2.5s' }}></span>
            SDK Ready
          </span>
        </div>

      </div>
    </header>
  )
}
