// Single source of truth for all ClusterMap entity data.
// Schema: { id, label, address, netWorth, category, risk, notes? }
// category: 'cex' | 'whale' | 'alpha' | 'fund' | 'retail'
// risk: 'high' | 'medium' | 'low'

export const CEX_ENTITIES = [
  {
    id: 'cex_binance14',
    label: 'Binance 14',
    address: '0x28C6c06298d514Db089934071355E5743bf21d60',
    netWorth: 8_400_000_000,
    category: 'cex',
    risk: 'low',
    notes: 'Largest CEX hot wallet by on-chain holdings',
  },
  {
    id: 'cex_coinbase',
    label: 'Coinbase Prime',
    address: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
    netWorth: 6_300_000_000,
    category: 'cex',
    risk: 'low',
    notes: 'Institutional custody and prime brokerage wallet',
  },
  {
    id: 'cex_bybit',
    label: 'Bybit',
    address: '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
    netWorth: 4_200_000_000,
    category: 'cex',
    risk: 'low',
    notes: 'Primary Bybit exchange hot wallet',
  },
  {
    id: 'cex_okx',
    label: 'OKX',
    address: '0xa7EFAe728D2936e78BDA97dc267687568dD593f3',
    netWorth: 3_200_000_000,
    category: 'cex',
    risk: 'low',
    notes: 'OKX main funding wallet',
  },
  {
    id: 'cex_kraken',
    label: 'Kraken',
    address: '0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2',
    netWorth: 2_400_000_000,
    category: 'cex',
    risk: 'low',
    notes: 'Kraken primary hot wallet',
  },
  {
    id: 'cex_kucoin',
    label: 'KuCoin',
    address: '0x2B5634C42055806a59e9107ED44D43c426E58258',
    netWorth: 1_800_000_000,
    category: 'cex',
    risk: 'medium',
    notes: 'KuCoin exchange wallet',
  },
  {
    id: 'cex_cryptocom',
    label: 'Crypto.com',
    address: '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
    netWorth: 1_200_000_000,
    category: 'cex',
    risk: 'low',
    notes: 'Crypto.com exchange cold wallet',
  },
  {
    id: 'cex_bitfinex',
    label: 'Bitfinex',
    address: '0x1151314c646Ce4E0eFD76d1aF4760aE66a9Fe30F',
    netWorth: 980_000_000,
    category: 'cex',
    risk: 'medium',
    notes: 'Bitfinex exchange wallet',
  },
  {
    id: 'cex_gateio',
    label: 'Gate.io',
    address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
    netWorth: 920_000_000,
    category: 'cex',
    risk: 'medium',
    notes: 'Gate.io main exchange wallet',
  },
  {
    id: 'cex_mexc',
    label: 'MEXC',
    address: '0x75e89d5979E4f6Fba9F97c104c2F0AFB3F1dcB88',
    netWorth: 680_000_000,
    category: 'cex',
    risk: 'medium',
    notes: 'MEXC exchange hot wallet',
  },
]

export const WHALE_ENTITIES = [
  {
    id: 'whale_gcr',
    label: 'GCR',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 425_000_000,
    category: 'whale',
    risk: 'high',
    notes: 'Pseudonymous macro trader. Known for large leveraged positions across cycles.',
  },
  {
    id: 'whale_light',
    label: 'Light',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 280_000_000,
    category: 'whale',
    risk: 'high',
    notes: 'Veteran crypto trader. Heavy ETH and DeFi exposure.',
  },
  {
    id: 'whale_tetranode',
    label: 'Tetranode',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 195_000_000,
    category: 'whale',
    risk: 'high',
    notes: 'OG ETH whale and DeFi participant.',
  },
  {
    id: 'whale_mosi',
    label: 'Mosi',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 142_000_000,
    category: 'whale',
    risk: 'high',
    notes: 'Emerging whale. Multi-chain exposure with BTC base.',
  },
  {
    id: 'whale_cobie',
    label: 'Cobie',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 88_000_000,
    category: 'whale',
    risk: 'medium',
    notes: 'Host of Up Only. Known portfolio construction approach.',
  },
  {
    id: 'whale_ansem',
    label: 'Ansem',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 64_000_000,
    category: 'whale',
    risk: 'high',
    notes: 'High-conviction alt trader. Concentrated positions.',
  },
]

export const ALPHA_ENTITIES = [
  {
    id: 'alpha_hsaka',
    label: 'Hsaka',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 48_000_000,
    category: 'alpha',
    risk: 'high',
    notes: 'Technical trader. Known for precise entries on BTC/ETH.',
  },
  {
    id: 'alpha_inversebrah',
    label: 'Inversebrah',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 32_000_000,
    category: 'alpha',
    risk: 'high',
    notes: 'Contrarian trader. Fades retail sentiment.',
  },
  {
    id: 'alpha_pentoshi',
    label: 'Pentoshi',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 28_000_000,
    category: 'alpha',
    risk: 'high',
    notes: 'Macro-focused crypto trader and analyst.',
  },
  {
    id: 'alpha_degenspartan',
    label: 'DegenSpartan',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 24_000_000,
    category: 'alpha',
    risk: 'high',
    notes: 'DeFi-native alpha. Early mover in yield strategies.',
  },
  {
    id: 'alpha_traderjoe',
    label: 'Trader Joe',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 18_000_000,
    category: 'alpha',
    risk: 'medium',
    notes: 'Mid-cap alt specialist. Avax and L2 focused.',
  },
]

export const FUND_ENTITIES = [
  {
    id: 'fund_paradigm',
    label: 'Paradigm',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 1_820_000_000,
    category: 'fund',
    risk: 'low',
    notes: 'Research-driven crypto VC. Major investor in DeFi infrastructure.',
  },
  {
    id: 'fund_a16z',
    label: 'a16z Crypto',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 1_640_000_000,
    category: 'fund',
    risk: 'low',
    notes: 'Andreessen Horowitz crypto fund. Consumer + L1 focus.',
  },
  {
    id: 'fund_polychain',
    label: 'Polychain',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 1_240_000_000,
    category: 'fund',
    risk: 'low',
    notes: 'OG crypto VC. Protocol-layer and governance positions.',
  },
  {
    id: 'fund_pantera',
    label: 'Pantera',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 980_000_000,
    category: 'fund',
    risk: 'low',
    notes: 'Longest-running crypto fund. Early BTC and DeFi thesis.',
  },
  {
    id: 'fund_dragonfly',
    label: 'Dragonfly',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 680_000_000,
    category: 'fund',
    risk: 'medium',
    notes: 'Asia-Pacific focused crypto fund.',
  },
  {
    id: 'fund_multicoin',
    label: 'Multicoin',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 740_000_000,
    category: 'fund',
    risk: 'medium',
    notes: 'Thesis-driven fund. Known for SOL early conviction.',
  },
  {
    id: 'fund_variant',
    label: 'Variant',
    address: '0x0000000000000000000000000000000000000000',
    netWorth: 520_000_000,
    category: 'fund',
    risk: 'low',
    notes: 'Consumer crypto focus. User-owned internet thesis.',
  },
]

// Deterministic pseudo-random helpers for synthetic retail data
function _seededInt(seed) {
  let h = seed ^ 0xdeadbeef
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  return (h ^ (h >>> 16)) >>> 0
}

// Generates a full 40-hex-char address: 0x + 40 chars = 42 chars total
function _syntheticFullAddr(i) {
  const hex = '0123456789abcdef'
  let s = _seededInt(i * 7919 + 1)
  let addr = '0x'
  for (let j = 0; j < 40; j++) {
    s = _seededInt(s + j + 1)
    addr += hex[s % 16]
  }
  return addr
}

// Truncated display form: 0xXXXX...XXXX (matches shortAddress convention)
function _truncAddr(full) {
  return `${full.slice(0, 6)}...${full.slice(-4)}`
}

export const RETAIL_ENTITIES = Array.from({ length: 40 }, (_, i) => {
  const s1    = _seededInt(i * 1021 + 3)
  const s2    = _seededInt(i * 1021 + 7)
  const full  = _syntheticFullAddr(i)
  const netWorth = 5_000 + (s1 % 495_000)
  const riskIdx  = s2 % 3
  return {
    id:       `retail_${i}`,
    label:    _truncAddr(full),   // shown on cluster node and in drawer header
    address:  full,               // full address shown in drawer address field
    netWorth,
    category: 'retail',
    risk: riskIdx === 0 ? 'high' : riskIdx === 1 ? 'medium' : 'low',
  }
})
