import React, { useState, useRef, useEffect } from 'react'
import './ARIA.css'

const SUGGESTIONS = [
  'Why is my risk elevated?',
  'What is RWA/Crypto divergence?',
  'Explain Stake-for-Service',
  'Why is BTC pumping?',
  'What are reactive transactions?',
  'Analyze current signals',
]

const WELCOME = {
  role: 'aria',
  text: "Hi, I'm ARIA — your Rialo Signal intelligence assistant. Ask me anything about your portfolio risk, current signals, token analysis, or how Rialo works. I'm aware of live market data right now."
}

export default function ARIA({ wallet = '' }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api'
      const resp = await fetch(`${apiBase}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, wallet })
      })
      const data = await resp.json()
      setMessages(prev => [...prev, { role: 'aria', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'aria', text: 'I had trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <button className="aria-toggle" onClick={() => setOpen(o => !o)} title="Ask ARIA">
        {open ? '✕' : '◆'}
      </button>

      {open && (
        <div className="aria-panel">
          <div className="aria-header">
            <div className="aria-avatar">◆</div>
            <div className="aria-header-info">
              <div className="aria-name">ARIA</div>
              <div className="aria-status">
                <span className="dot-pulse" style={{width:'5px',height:'5px',borderRadius:'50%',background:'#00e5b4',animation:'pulse-anim 1.8s ease-in-out infinite'}}></span>
                Rialo Signal Intelligence
              </div>
            </div>
            <button className="aria-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="aria-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-wrap ${msg.role === 'user' ? 'user' : ''}`}>
                <div className={`msg-avatar ${msg.role === 'aria' ? 'aria-av' : 'user-av'}`}>
                  {msg.role === 'aria' ? '◆' : 'U'}
                </div>
                <div className={`msg-bubble ${msg.role === 'aria' ? 'aria-bubble' : 'user-bubble'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-wrap">
                <div className="msg-avatar aria-av">◆</div>
                <div className="msg-bubble aria-bubble">
                  <div className="msg-typing">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="aria-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="aria-suggest-btn" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="aria-input-row">
            <textarea
              ref={inputRef}
              className="aria-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask ARIA anything..."
              rows={1}
            />
            <button className="aria-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
