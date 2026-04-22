import axios from 'axios'

/*
  API SERVICE — Rialo Signal
  ===========================
  This is the ONLY place in the frontend that knows the backend exists.
  All components import from here — they never call fetch() directly.

  Why? Because if the API URL changes, you change it in ONE place.
  This is called the "Single Responsibility Principle."

  axios is like fetch() but:
  - Automatically parses JSON responses
  - Has better error handling
  - Lets you set a base URL once
*/

const api = axios.create({
  baseURL: '/api',      // Vite proxy forwards this to http://localhost:8000/api
  timeout: 10000,       // 10 seconds — if backend doesn't respond, fail gracefully
  headers: {
    'Content-Type': 'application/json',
  }
})

/*
  Response interceptor — runs on EVERY response before it reaches your component.
  If the request fails, we return a fallback instead of crashing the app.
  This is critical for demo stability.
*/
api.interceptors.response.use(
  response => response.data,     // On success: just return the data, not the whole response object
  error => {
    console.warn('API error:', error.message)
    return Promise.reject(error) // Let the calling code handle it
  }
)

// ─── Prices ──────────────────────────────────────────────────────────────────

export const fetchAllPrices = () =>
  api.get('/prices/all')

export const fetchCryptoPrices = (symbols = 'BTC,ETH,SOL,BNB,AVAX') =>
  api.get(`/prices/crypto?symbols=${symbols}`)

export const fetchRWAPrices = () =>
  api.get('/prices/rwa')

// ─── Signals ─────────────────────────────────────────────────────────────────

export const fetchLiveSignals = () =>
  api.get('/signals/live')

export const fetchPumpSignals = (symbol) =>
  api.get(`/signals/pump/${symbol}`)

// ─── Token Intelligence ───────────────────────────────────────────────────────

export const fetchTokenIntelligence = (symbol) =>
  api.get(`/tokens/${symbol}`)

// ─── Wallet Analysis ─────────────────────────────────────────────────────────

export const fetchWalletAnalysis = (address) =>
  api.get(`/wallet/${address}`)

// ─── Rialo SDK ────────────────────────────────────────────────────────────────

export const fetchRialoStatus = () =>
  api.get('/rialo/status')

export const fetchStreamFeed = (pair) =>
  api.get(`/rialo/stream/${pair}`)

export const fetchSFSEstimate = (staked, fraction) =>
  api.get(`/rialo/sfs/estimate?staked_rlo=${staked}&routing_fraction=${fraction}`)
