// 简单 SuperTrend 实现（非完整交易所风格，但适合浏览器环境）
import { calculateATR } from './atr'

export function calculateSuperTrend(klines, atrPeriod = 10, multiplier = 3) {
  const closes = klines.map(k => k.close)
  const atr = calculateATR(klines, atrPeriod)
  const superTrend = []

  for (let i = atrPeriod; i < klines.length; i++) {
    const midPrice = (klines[i].high + klines[i].low) / 2
    const upperBand = midPrice + multiplier * atr[i - atrPeriod]
    const lowerBand = midPrice - multiplier * atr[i - atrPeriod]

    const prev = superTrend[superTrend.length - 1] || { trend: true, value: lowerBand }
    const currentClose = closes[i]

    const trendUp = currentClose > prev.value
    const value = trendUp ? lowerBand : upperBand

    superTrend.push({
      trend: trendUp,
      value
    })
  }

  return superTrend
}
