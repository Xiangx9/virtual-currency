import { EMA, MACD } from 'technicalindicators'
import { calculateSuperTrend } from '../indicators/supertrend'
import { calculateADX } from '../indicators/adx'
import { calculateATR } from '../indicators/atr'
import { getTPandSL } from '../helpers/tpSl'

export function useTrendStrategy(klines1h, klines4h, symbol = '资产') {
  const closes1h = klines1h.map(k => k.close)
  const closes4h = klines4h.map(k => k.close)
  const price = closes1h.at(-1)

  const ema20_4h = EMA.calculate({ period: 20, values: closes4h })
  const ema50_4h = EMA.calculate({ period: 50, values: closes4h })
  const macd_4h = MACD.calculate({ values: closes4h, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 })
  const adx_4h = calculateADX(klines4h)
  const supertrend_4h = calculateSuperTrend(klines4h)
  const atr = calculateATR(klines1h).at(-1)

  const macd = macd_4h.at(-1)
  const adx = adx_4h.at(-1)
  const supertrend = supertrend_4h.at(-1)

  let direction = 'neutral(中性)'
  let entrySignal = false
  let reasons = []

  if (ema20_4h.at(-1) > ema50_4h.at(-1) && macd.MACD > macd.signal && supertrend.trend && adx.adx > 20) {
    direction = 'lon'
    entrySignal = true
    reasons.push('多头趋势强劲：EMA、MACD、Supertrend一致')
  } else if (ema20_4h.at(-1) < ema50_4h.at(-1) && macd.MACD < macd.signal && !supertrend.trend && adx.adx > 20) {
    direction = 'short'
    entrySignal = true
    reasons.push('空头趋势强劲：EMA、MACD、Supertrend一致')
  } else {
    reasons.push('趋势不明朗：EMA、MACD、Supertrend、ADX不一致')
  }

  const sltp = getTPandSL({
    currentPrice: price,
    direction,
    atr,
    atrMultiplierTP: 2.5,
    atrMultiplierSL: 1.5
  })

  return {
    strategy: 'trend',
    mode: 'trend',
    time: new Date().toLocaleString(),
    symbol,
    trendDirection: direction,
    entrySignal,
    entryReasons: reasons,
    currentPrice: price,
    ...sltp,
    suggestion: entrySignal
      ? `📈 当前处于${direction === 'long' ? '多头' : '空头'}趋势，建议顺势跟进`
      : `🤔 趋势不明朗，建议观望`
  }
}
