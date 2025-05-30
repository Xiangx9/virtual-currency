// 趋势强度指标 ADX
import { ADX } from 'technicalindicators'

export function calculateADX(klines, period = 14) {
  const highs = klines.map(k => k.high)
  const lows = klines.map(k => k.low)
  const closes = klines.map(k => k.close)

  return ADX.calculate({
    period,
    high: highs,
    low: lows,
    close: closes
  })
}
