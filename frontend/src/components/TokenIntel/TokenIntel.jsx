import React, { useState, useEffect, useRef } from 'react'
import { useToken } from '../../hooks/useToken'
import { formatPrice, formatChange, formatCompact, changeClass } from '../../utils/format'
import './TokenIntel.css'

const QUICK_TOKENS = ['BTC', 'ETH', 'SOL', 'RLO']

const AI_CONTENT = {
  BTC: [
    { mode: 'Explain this token', text: 'Bitcoin is the original proof-of-work blockchain and largest crypto asset by market cap. Fixed 21M supply cap makes it digital gold. On Rialo, BTC price data flows natively onchain via Rialo Stream — no oracle contract, no middleware, just a one-liner in your smart contract.' },
    { mode: 'Why is this pumping?', text: 'BTC is moving on a short liquidation cascade — over $890M in shorts force-closed in 4 hours. Smart money wallets added a net $142M in 24h. On Rialo, a reactive predicate would have already fired a rebalancing TX automatically — no bot, no keeper.' },
    { mode: 'Summarize onchain activity', text: 'Exchange inflows are dropping while accumulation wallets are filling — historically bullish. Real liquidity ($1.84B) is 42% below reported ($3.2B). Rialo Read Path delivers this state directly from validators — no indexer, no $3k/month overhead.' },
  ],
  ETH: [
    { mode: 'Explain this token', text: 'Ethereum is the largest smart contract platform. Proof-of-stake since 2022 makes it a yield-bearing asset. SVM-compatible with Rialo VM — your contracts can migrate to Rialo and immediately gain reactive execution and gasless transactions via Stake-for-Service.' },
    { mode: 'Why is this pumping?', text: 'ETH is moving on institutional rotation — smart money shifted from BTC after a staking yield uptick. Real liquidity at $920M is 49% below reported, partly due to wash trading on offshore venues.' },
    { mode: 'Summarize onchain activity', text: 'Net DEX inflow with Uniswap v3 pool depth increasing. A known smart money wallet historically front-runs major moves by 12-18h — it entered 6h ago. Rialo IPC enables private tracking without exposing your strategy onchain.' },
  ],
  SOL: [
    { mode: 'Explain this token', text: 'Solana is a high-throughput L1 with parallel transaction execution. SVM-compatible — Rialo VM also supports SVM, meaning Solana contracts deploy to Rialo immediately and gain reactive transactions and native Web2 API calls.' },
    { mode: 'Why is this pumping?', text: 'SOL up 3.2% on strong NFT activity and memecoin season. Real liquidity gap is large — reported $890M but real orderbook depth is $340M, a 62% inflation from bot-driven wash trading.' },
    { mode: 'Summarize onchain activity', text: 'SOL distribution is more concentrated than BTC/ETH — top 10 wallets hold 24%. Two are VC unlock wallets with linear vesting. On Rialo, set a predicate: if vesting wallet moves funds, auto-hedge immediately inside consensus.' },
  ],
  RLO: [
    { mode: 'Explain this token', text: 'RLO is the native Rialo protocol token. It powers Stake-for-Service — staking yield auto-converts to service credits for gas, reactive TX fees, and storage. No manual top-ups. A genuine self-sustaining flywheel.' },
    { mode: 'Why is this pumping?', text: 'RLO is pre-launch — mainnet 2026. The tokenomics are architecturally significant. RLO is not just a fee token — it is a consumable budget for network services. Stakers earn yield AND that yield funds their onchain activity.' },
    { mode: 'Summarize onchain activity', text: 'The most powerful RLO use case for Rialo Signal is Stake-for-Service: stake RLO, route yield to cover every reactive predicate check and Rialo Edge API call. Your analytics platform runs forever — self-funded from its own staking position.' },
  ],
}

const DEFAULT_AI = [
  { mode: 'Explain this token', text: 'Analyzing token against live onchain data. Rialo Signal cross-references real liquidity, whale positions, and smart money flows to give you a complete picture.' },
  { mode: 'Why is this pumping?', text: 'Scanning pump signal drivers: whale accumulation, short liquidations, exchange inflow, social sentiment, and smart money positioning.' },
  { mode: 'Summarize onchain activity', text: 'Summarizing recent transactions, liquidity changes, and distribution shifts. Rialo Read Path would deliver this state from validators in real time.' },
]

export default function TokenIntel() {
  const [inputVal, setInputVal] = useState('')
  const [activeQuick, setActive] = useState('BTC')
  const { token, loading, error, fetchToken } = useToken()
  const [aiContent, setAiContent] = useState(AI_CONTENT.BTC)
  const [aiIdx, setAiIdx] = useState(0)
  const [aiText, setAiText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typeTimerRef = useRef(null)
  const rotateTimerRef = useRef(null)

  useEffect(() => { fetchToken('BTC') }, [])

  useEffect(() => {
    if (!token) return
    const content = AI_CONTENT[token.symbol] || DEFAULT_AI
    setAiContent(content)
    setAiIdx(0)
    startTyping(content[0].text)
  }, [token?.symbol])

  useEffect(() => {
    rotateTimerRef.current = setInterval(() => {
      setAiIdx(prev => {
        const next = (prev + 1) % aiContent.length
        startTyping(aiContent[next].text)
        return next
      })
    }, 10000)
    return () => clearInterval(rotateTimerRef.current)
  }, [aiContent])

  function startTyping(text) {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current)
    setIsTyping(true)
    setAiText('')
    let i = 0
    typeTimerRef.current = setInterval(() => {
      i++
      setAiText(text.slice(0, i))
      if (i >= text.length) { clearInterval(typeTimerRef.current); setIsTyping(false) }
    }, 18)
  }

  function handleQuickToken(sym) { setActive(sym); setInputVal(''); fetchToken(sym) }
  function handleAnalyze() { const sym = inputVal.trim().toUpperCase() || activeQuick; setActive(sym); fetchToken(sym) }

  const dist = token?.distribution ?? { top10_whales: 18, exchanges: 14, smart_money: 22, retail: 46 }
  const liqReal     = token?.real_liquidity     ?? 0
  const liqReported = token?.reported_liquidity ?? 0
  const liqAuth     = token?.liquidity_authenticity ?? 58

  return (
    <div>
      <div className="ti-search">
        <input className="ti-input" value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          placeholder="Token name, symbol, or contract address..." />
        {QUICK_TOKENS.map(sym => (
          <button key={sym} className={`quick-btn ${activeQuick === sym ? 'active' : ''}`} onClick={() => handleQuickToken(sym)}>{sym}</button>
        ))}
        <button className="analyze-btn" onClick={handleAnalyze}>Analyze ↗</button>
      </div>

      <div className="ti-metrics">
        <div className="sd-card">
          <div className="sd-card-title">Price</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:700}}>
            {loading ? '...' : token?.status === 'pre_launch' ? 'Pre-launch' : formatPrice(token?.price ?? 0)}
          </div>
          <div className={`metric-card-sub ${changeClass(token?.change_24h)}`}>
            {token?.change_24h != null ? formatChange(token.change_24h) + ' (24h)' : '—'}
          </div>
        </div>
        <div className="sd-card">
          <div className="sd-card-title">Real Liquidity <span className="pill pill-sdk" style={{fontSize:'9px',padding:'1px 5px'}}>SDK</span></div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:700,color:'#00e5b4'}}>{liqReal ? formatCompact(liqReal) : 'TBD'}</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'4px'}}>vs {liqReported ? formatCompact(liqReported) : '—'} reported</div>
        </div>
        <div className="sd-card">
          <div className="sd-card-title">Smart Money Flow</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:700,color:'#00e5b4'}}>{token?.smart_money_flow ?? '—'}</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginTop:'4px'}}>Net 24h</div>
        </div>
        <div className="sd-card">
          <div className="sd-card-title">Scam Risk</div>
          <div style={{marginTop:'4px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span className={`scam-badge ${token?.meta?.scam_risk === 'none' ? 'scam-safe' : token?.meta?.scam_risk === 'low' ? 'scam-warn' : 'scam-danger'}`}>
              {token?.meta?.scam_risk === 'none' ? 'Verified' : token?.meta?.scam_risk === 'low' ? 'Low Risk' : token?.meta?.scam_risk ?? 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-header">
          <div className="ai-orb">◆</div>
          <span className="ai-label">Rialo Signal AI</span>
          <span className="ai-mode">{aiContent[aiIdx]?.mode}</span>
          <span className="pill pill-live" style={{fontSize:'9px',padding:'2px 6px'}}><span className="dot-pulse"></span> Analyzing</span>
        </div>
        <div className="ai-text">{aiText}{isTyping && <span className="ai-cursor"></span>}</div>
      </div>

      <div className="ti-grid">
        <div className="ti-card">
          <div className="ti-card-title">Why is this pumping?</div>
          {(token?.pump_signals ?? []).map((sig, i) => {
            const color = sig.direction === 'bullish' ? '#00e5b4' : sig.direction === 'bearish' ? '#ef4444' : sig.direction === 'catalyst' ? '#f59e0b' : '#7B6EF6'
            return (
              <div className="pump-row" key={i}>
                <div className="pump-icon" style={{background:color+'22',color}}>▲</div>
                <div className="pump-signal-name">{sig.signal}</div>
                <div className="pump-meter"><div className="pump-meter-fill" style={{width:`${sig.strength*100}%`,background:color}}/></div>
                <div className="pump-strength" style={{color}}>{(sig.strength*100).toFixed(0)}%</div>
              </div>
            )
          })}
        </div>
        <div className="ti-card">
          <div className="ti-card-title">Real vs Reported Liquidity <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>Rialo Stream</span></div>
          {[
            {source:'Binance spot',  real:liqReal*0.46, rep:liqReported*0.38},
            {source:'Coinbase spot', real:liqReal*0.28, rep:liqReported*0.26},
            {source:'Uniswap v3',   real:liqReal*0.17, rep:liqReported*0.17},
            {source:'OKX perp',     real:liqReal*0.09, rep:liqReported*0.19},
          ].map((row,i) => (
            <div className="liq-row" key={i}>
              <span className="liq-source">{row.source}</span>
              <div><span className="liq-real up">{formatCompact(row.real)}</span><span className="liq-fake">reported {formatCompact(row.rep)}</span></div>
            </div>
          ))}
          <div className="liq-row" style={{borderTop:'0.5px solid rgba(255,255,255,0.08)',marginTop:'4px',paddingTop:'8px'}}>
            <span style={{fontWeight:500}}>Real total</span>
            <div><span className="liq-real up" style={{fontSize:'14px'}}>{formatCompact(liqReal)}</span><span className="liq-fake">vs {formatCompact(liqReported)} reported ({liqAuth}% authentic)</span></div>
          </div>
        </div>
      </div>

      <div className="ti-card" style={{marginBottom:'14px'}}>
        <div className="ti-card-title">Holder Distribution <span className="pill pill-sdk" style={{fontSize:'9px',padding:'2px 5px'}}>Rialo IPC</span></div>
        <div className="dist-bar">
          <div className="dist-seg" style={{width:`${dist.top10_whales}%`,background:'#ef4444'}}/>
          <div className="dist-seg" style={{width:`${dist.exchanges}%`,background:'#f59e0b'}}/>
          <div className="dist-seg" style={{width:`${dist.smart_money}%`,background:'#7B6EF6'}}/>
          <div className="dist-seg" style={{width:`${dist.retail}%`,background:'rgba(0,229,180,0.55)'}}/>
        </div>
        <div className="dist-legend">
          <span><span className="dist-dot" style={{background:'#ef4444'}}></span>Top 10 whales: <span className="down">{dist.top10_whales}%</span></span>
          <span><span className="dist-dot" style={{background:'#f59e0b'}}></span>Exchanges: <span className="warn">{dist.exchanges}%</span></span>
          <span><span className="dist-dot" style={{background:'#7B6EF6'}}></span>Smart money: <span style={{color:'#7B6EF6'}}>{dist.smart_money}%</span></span>
          <span><span className="dist-dot" style={{background:'rgba(0,229,180,0.6)'}}></span>Retail: <span className="up">{dist.retail}%</span></span>
        </div>
      </div>
    </div>
  )
}
