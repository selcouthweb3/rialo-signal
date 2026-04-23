import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.warn('API error:', error.message)
    return Promise.reject(error)
  }
)

export const fetchAllPrices = () => api.get('/prices/all')
export const fetchCryptoPrices = (symbols = 'BTC,ETH,SOL,BNB,AVAX') =>
  api.get(`/prices/crypto?symbols=${symbols}`)
export const fetchRWAPrices = () => api.get('/prices/rwa')
export const fetchLiveSignals = () => api.get('/signals/live')
export const fetchPumpSignals = (symbol) => api.get(`/signals/pump/${symbol}`)
export const fetchTokenIntelligence = (symbol) => api.get(`/tokens/${symbol}`)
export const fetchWalletAnalysis = (address) => api.get(`/wallet/${address}`)
export const fetchRialoStatus = () => api.get('/rialo/status')
export const fetchStreamFeed = (pair) => api.get(`/rialo/stream/${pair}`)
export const fetchSFSEstimate = (staked, fraction) =>
  api.get(`/rialo/sfs/estimate?staked_rlo=${staked}&routing_fraction=${fraction}`)
