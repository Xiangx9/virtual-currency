// 用于计算平均真实波幅（ATR）
import { ATR } from 'technicalindicators'

export function calculateATR(klines, period = 14) {
  const highs = klines.map(k => k.high)
  const lows = klines.map(k => k.low)
  const closes = klines.map(k => k.close)

  return ATR.calculate({
    period,
    high: highs,
    low: lows,
    close: closes
  })
}
