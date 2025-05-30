// Money Flow Index（资金流入流出指标）
import { MFI } from 'technicalindicators'

export function calculateMFI(klines, period = 14) {
  const highs = klines.map(k => k.high)
  const lows = klines.map(k => k.low)
  const closes = klines.map(k => k.close)
  const volumes = klines.map(k => k.volume)

  return MFI.calculate({
    high: highs,
    low: lows,
    close: closes,
    volume: volumes,
    period
  })
}
