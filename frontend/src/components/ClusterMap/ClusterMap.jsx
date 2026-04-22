import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import './ClusterMap.css'

function seed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return ((h >>> 0) % 10000) / 10000
}

function genWhaleNodes() {
  const types = [
    { type: 'mega_whale', label: 'Mega Whale',  count: 4,  sizeRange: [42,58], color: '#ef4444' },
    { type: 'exchange',   label: 'Exchange',     count: 5,  sizeRange: [32,46], color: '#f59e0b' },
    { type: 'smart',      label: 'Smart Money',  count: 7,  sizeRange: [22,34], color: '#7B6EF6' },
    { type: 'vc',         label: 'VC / Fund',    count: 5,  sizeRange: [28,42], color: '#38bdf8' },
    { type: 'retail',     label: 'Retail',       count: 12, sizeRange: [22,32], color: '#00e5b4' },
  ]
  const nodes = []
  types.forEach(t => {
    for (let i = 0; i < t.count; i++) {
      const id = `${t.type}_${i}`
      const s  = seed(id)
      const r  = t.sizeRange[0] + s * (t.sizeRange[1] - t.sizeRange[0])
      nodes.push({
        id, type: t.type, label: t.label, color: t.color, r,
        name: t.type === 'mega_whale' ? `Whale ${i+1}` :
              t.type === 'exchange'   ? `CEX ${i+1}` :
              t.type === 'smart'      ? `Alpha ${i+1}` :
              t.type === 'vc'         ? `Fund ${i+1}` : `Wallet ${i+1}`,
        pct: (r/380*100).toFixed(1)+'%',
        holding: '$'+(r*6.5+10).toFixed(1)+'M',
        txCount: Math.floor(s*2400+20),
        lastMove: Math.floor(s*48+1)+'h ago'
      })
    }
  })
  const megas  = nodes.filter(n => n.type === 'mega_whale')
  const smarts = nodes.filter(n => n.type === 'smart')
  const links  = []
  megas.forEach(m => smarts.slice(0,3).forEach(s => links.push({ source: m.id, target: s.id, strength: 0.4 })))
  smarts.slice(0,4).forEach((s,i) => {
    if (smarts[i+1]) links.push({ source: s.id, target: smarts[i+1].id, strength: 0.25 })
  })
  return { nodes, links }
}

function genSignalNodes() {
  const sigs = [
    { id:'vol',       name:'Volatility',    r:48, val:'0.72', color:'#f59e0b', desc:'Elevated — predicate armed' },
    { id:'spread',    name:'RWA/Crypto',    r:54, val:'0.81', color:'#ef4444', desc:'Critical divergence' },
    { id:'momentum',  name:'Momentum',      r:40, val:'0.65', color:'#00e5b4', desc:'Positive signal' },
    { id:'liquidity', name:'Liquidity',     r:36, val:'0.58', color:'#00e5b4', desc:'Real vs reported gap' },
    { id:'yield',     name:'Yield Div.',    r:44, val:'0.77', color:'#f59e0b', desc:'Bond/crypto decoupling' },
    { id:'sentiment', name:'Sentiment',     r:32, val:'0.61', color:'#00e5b4', desc:'Positive spike 2h ago' },
    { id:'whale_acc', name:'Whale Accum.',  r:42, val:'0.82', color:'#ef4444', desc:'Smart money buying' },
    { id:'exchange',  name:'CEX Flow',      r:34, val:'0.44', color:'#38bdf8', desc:'Supply leaving CEXs' },
  ]
  const links = [
    { source:'vol',       target:'spread',    strength:0.7  },
    { source:'spread',    target:'yield',     strength:0.85 },
    { source:'momentum',  target:'whale_acc', strength:0.6  },
    { source:'sentiment', target:'momentum',  strength:0.5  },
    { source:'whale_acc', target:'spread',    strength:0.65 },
    { source:'exchange',  target:'liquidity', strength:0.55 },
  ]
  return {
    nodes: sigs.map(s => ({ ...s, type:'signal', label:s.name, pct:s.val, holding:s.desc, txCount:null, lastMove:'Live' })),
    links
  }
}

function genFlowNodes() {
  const all = [
    { id:'us10y', name:'US 10Y',    r:42, color:'#00e5b4', cat:'rwa',    val:'-0.3%', holding:'4.40% yield' },
    { id:'gold',  name:'Gold',      r:40, color:'#00e5b4', cat:'rwa',    val:'+0.8%', holding:'$3,314/oz'   },
    { id:'spx',   name:'S&P 500',   r:44, color:'#00e5b4', cat:'rwa',    val:'+0.5%', holding:'$5,282'      },
    { id:'oil',   name:'Oil',       r:32, color:'#00e5b4', cat:'rwa',    val:'-0.8%', holding:'$64.1/bbl'   },
    { id:'btc',   name:'BTC',       r:54, color:'#7B6EF6', cat:'crypto', val:'+1.2%', holding:'$75,000'     },
    { id:'eth',   name:'ETH',       r:46, color:'#7B6EF6', cat:'crypto', val:'-2.2%', holding:'$1,580'      },
    { id:'sol',   name:'SOL',       r:38, color:'#7B6EF6', cat:'crypto', val:'-1.1%', holding:'$120'        },
    { id:'rlo',   name:'RLO',       r:30, color:'#00e5b4', cat:'crypto', val:'TBD',   holding:'Rialo native'},
    { id:'defi',  name:'DeFi',      r:34, color:'#7B6EF6', cat:'crypto', val:'+1.8%', holding:'Basket'      },
  ]
  const links = [
    { source:'spx',   target:'btc', strength:0.48 },
    { source:'spx',   target:'eth', strength:0.54 },
    { source:'gold',  target:'btc', strength:0.22 },
    { source:'us10y', target:'btc', strength:0.15 },
    { source:'spx',   target:'sol', strength:0.41 },
  ]
  return {
    nodes: all.map(n => ({ ...n, type:n.cat, label:n.cat==='rwa'?'RWA':'Crypto', pct:n.val, txCount:null, lastMove:'Live' })),
    links
  }
}

const VIEWS = {
  whale: {
    label:'Whale wallet clusters', gen:genWhaleNodes,
    stats:['247','18.4%','22.1%','0 bots'],
    statLbl:['Wallets tracked','Whale concentration','Smart money','Bots required'],
    legend:[
      {color:'#ef4444',label:'Mega whale'},
      {color:'#f59e0b',label:'Exchange'},
      {color:'#7B6EF6',label:'Smart money'},
      {color:'#38bdf8',label:'VC / Fund'},
      {color:'#00e5b4',label:'Retail'},
    ],
  },
  signal: {
    label:'Signal relationship map', gen:genSignalNodes,
    stats:['8','0.74','2','0 bots'],
    statLbl:['Active signals','Avg strength','Critical alerts','Bots required'],
    legend:[
      {color:'#00e5b4',label:'Bullish signal'},
      {color:'#ef4444',label:'Bearish signal'},
      {color:'#f59e0b',label:'Warning signal'},
    ],
  },
  flow: {
    label:'RWA vs Crypto capital flow', gen:genFlowNodes,
    stats:['9','0.48','$3.3B','0 bots'],
    statLbl:['Assets tracked','RWA/Crypto corr.','Real liquidity','Bots required'],
    legend:[
      {color:'#00e5b4',label:'RWA asset'},
      {color:'#7B6EF6',label:'Crypto asset'},
    ],
  },
}

export default function ClusterMap() {
  const [activeView, setActiveView] = useState('whale')
  const svgRef     = useRef(null)
  const simRef     = useRef(null)
  const frameRef   = useRef(null)
  const tooltipRef = useRef(null)

  const draw = useCallback((viewKey) => {
    if (simRef.current)   simRef.current.stop()
    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    const svgEl = svgRef.current
    if (!svgEl) return

    const W = svgEl.clientWidth || 860
    const H = 560
    const svg = d3.select(svgEl)
    svg.attr('height', H).attr('width', W).selectAll('*').remove()

    const { nodes, links } = VIEWS[viewKey].gen()
    const nodeMap    = new Map(nodes.map(n => [n.id, n]))
    const validLinks = links.filter(l => nodeMap.has(l.source) && nodeMap.has(l.target))
    const cx = W / 2
    const cy = H / 2

    if (viewKey === 'flow') {
      svg.append('line')
        .attr('x1', cx).attr('y1', 20).attr('x2', cx).attr('y2', H - 20)
        .attr('stroke','rgba(255,255,255,0.06)').attr('stroke-width',1).attr('stroke-dasharray','5,4')
      svg.append('text').text('RWA')
        .attr('x', cx-80).attr('y',18).attr('fill','rgba(0,229,180,0.4)')
        .attr('font-size',10).attr('font-family','DM Mono,monospace').attr('text-anchor','middle')
      svg.append('text').text('CRYPTO')
        .attr('x', cx+80).attr('y',18).attr('fill','rgba(123,110,246,0.4)')
        .attr('font-size',10).attr('font-family','DM Mono,monospace').attr('text-anchor','middle')
    }

    const linkSel = svg.append('g').selectAll('line').data(validLinks).join('line')
      .attr('stroke','rgba(255,255,255,0.08)')
      .attr('stroke-width', d => d.strength * 2)
      .attr('stroke-dasharray','4,3')

    const nodeSel = svg.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor','pointer')
      .call(d3.drag()
        .on('start',(event,d) => { if(!event.active) simRef.current.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y })
        .on('drag', (event,d) => { d.fx=event.x; d.fy=event.y })
        .on('end',  (event,d) => { if(!event.active) simRef.current.alphaTarget(0); d.fx=null; d.fy=null })
      )

    nodeSel.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.18)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.85)

    nodeSel.append('text')
      .text(d => d.name)
      .attr('text-anchor','middle')
      .attr('dy','-0.1em')
      .attr('fill', d => d.color)
      .attr('font-size', d => Math.max(10, Math.min(13, d.r * 0.38)))
      .attr('font-family','DM Mono,monospace')
      .attr('font-weight','500')
      .attr('pointer-events','none')

    nodeSel.append('text')
      .text(d => d.pct)
      .attr('text-anchor','middle')
      .attr('dy','1.1em')
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.6)
      .attr('font-size', d => Math.max(9, Math.min(11, d.r * 0.28)))
      .attr('font-family','DM Mono,monospace')
      .attr('pointer-events','none')

    const tt = tooltipRef.current
    nodeSel
      .on('mouseover',(event,d) => {
        tt.style.opacity = '1'
        tt.innerHTML = `
          <div class="tt-name" style="color:${d.color}">${d.name}</div>
          <div class="tt-row"><span>Type</span><span class="tt-val">${d.label}</span></div>
          <div class="tt-row"><span>Value</span><span class="tt-val">${d.holding}</span></div>
          <div class="tt-row"><span>Signal</span><span class="tt-val">${d.pct}</span></div>
          ${d.txCount?`<div class="tt-row"><span>TXs</span><span class="tt-val">${d.txCount.toLocaleString()}</span></div>`:''}
          <div class="tt-row"><span>Updated</span><span class="tt-val">${d.lastMove}</span></div>
        `
      })
      .on('mousemove', event => {
        const rect = svgEl.parentElement.getBoundingClientRect()
        let x = event.clientX - rect.left + 14
        let y = event.clientY - rect.top  + 14
        if (x + 210 > rect.width) x = event.clientX - rect.left - 215
        tt.style.left = x+'px'; tt.style.top = y+'px'
      })
      .on('mouseout', () => { tt.style.opacity = '0' })

    let forceX, forceY
    if (viewKey === 'flow') {
      forceX = d3.forceX(d => d.cat==='rwa' ? cx-180 : cx+180).strength(0.12)
      forceY = d3.forceY(cy).strength(0.08)
    } else if (viewKey === 'signal') {
      forceX = d3.forceX(cx).strength(0.05)
      forceY = d3.forceY(cy).strength(0.05)
    } else {
      forceX = d3.forceX(d => {
        if (d.type==='mega_whale') return cx - 280
        if (d.type==='smart')      return cx - 80
        if (d.type==='exchange')   return cx + 280
        if (d.type==='vc')         return cx + 80
        return cx + 180
      }).strength(0.18)
      forceY = d3.forceY(d => {
        if (d.type==='mega_whale') return cy - 120
        if (d.type==='smart')      return cy - 60
        if (d.type==='exchange')   return cy - 100
        if (d.type==='vc')         return cy + 120
        return cy + 140
      }).strength(0.18)
    }

    simRef.current = d3.forceSimulation(nodes)
      .force('link',      d3.forceLink(validLinks).id(d=>d.id).distance(d=>90+d.strength*40).strength(0.3))
      .force('charge',    d3.forceManyBody().strength(d=>-d.r*10))
      .force('collision', d3.forceCollide(d=>d.r+8).strength(0.9))
      .force('x', forceX)
      .force('y', forceY)
      .alphaDecay(0.015)

    simRef.current.on('tick', () => {
      nodes.forEach(d => {
        d.x = Math.max(d.r+10, Math.min(W-d.r-10, d.x))
        d.y = Math.max(d.r+10, Math.min(H-d.r-10, d.y))
      })
      linkSel
        .attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
        .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y)
      nodeSel.attr('transform',d=>`translate(${d.x},${d.y})`)
    })

    let pulse = 0
    function animatePulse() {
      pulse += 0.04
      nodeSel.select('circle').attr('stroke-opacity',
        d => 0.6 + Math.sin(pulse+d.r*0.3)*(d.type==='mega_whale'?0.3:0.15)
      )
      frameRef.current = requestAnimationFrame(animatePulse)
    }
    animatePulse()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => draw(activeView), 100)
    return () => {
      clearTimeout(timeout)
      if (simRef.current)   simRef.current.stop()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [activeView, draw])

  useEffect(() => {
    const handleResize = () => draw(activeView)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeView, draw])

  const vd = VIEWS[activeView]

  return (
    <div>
      <div className="cm-header">
        <div className="cm-tabs">
          {Object.keys(VIEWS).map(key => (
            <button key={key} className={`cm-tab ${activeView===key?'active':''}`} onClick={()=>setActiveView(key)}>
              {key==='whale'?'Whale Wallets':key==='signal'?'Signal Map':'RWA vs Crypto'}
            </button>
          ))}
        </div>
        <span className="pill pill-live" style={{fontSize:'9px'}}>
          <span className="dot-pulse"></span> Force sim live
        </span>
      </div>

      <div className="cm-stats">
        {vd.statLbl.map((lbl,i) => (
          <div className="sd-card" key={lbl}>
            <div className="sd-card-title">{lbl}</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:'22px',fontWeight:700,color:i===3?'#00e5b4':'rgba(255,255,255,0.88)'}}>
              {vd.stats[i]}
            </div>
          </div>
        ))}
      </div>

      <div className="cm-canvas-wrap">
        <div className="cm-view-label">{vd.label}</div>
        <svg ref={svgRef} className="cm-svg" />
        <div ref={tooltipRef} className="cm-tooltip" />
        <div className="cm-legend">
          {vd.legend.map(l => (
            <div className="cm-leg-item" key={l.label}>
              <div className="cm-leg-dot" style={{background:l.color}} />
              {l.label}
            </div>
          ))}
          <div className="cm-leg-item" style={{marginLeft:'auto'}}>Size = holding · Hover · Drag</div>
        </div>
      </div>

      <div className="sdk-note">
        🔵 On mainnet: Rialo Read Path delivers wallet state from validators. No indexer, no API key.
      </div>
    </div>
  )
}
