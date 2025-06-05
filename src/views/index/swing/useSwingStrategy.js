// 技术指标分析与波段模块模块

import { EMA, MACD, RSI, BollingerBands } from 'technicalindicators'
import { calculateSuperTrend } from '../indicators/supertrend'
import { calculateADX } from '../indicators/adx'
import { calculateATR } from '../indicators/atr'
import { detectCandlestickPatterns } from '../helpers/patterns'
import { interpretVolumePrice } from '../helpers/volumePrice'
import { getTPandSL } from '../helpers/tpSl'
import { detectSupportResistanceV2 } from '../helpers/supportResistance'

export function useSwingStrategy(klines15m, klines1h, symbol) {
  const closes15m = klines15m.map(k => k.close)
  const closes1h = klines1h.map(k => k.close)
  const price = closes15m.at(-1)

  // === 趋势判断 (1H) ===
  const ema20_1h = EMA.calculate({ period: 20, values: closes1h })
  const ema50_1h = EMA.calculate({ period: 50, values: closes1h })
  const macd_1h = MACD.calculate({ values: closes1h, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 })
  const adx_1h = calculateADX(klines1h)
  const supertrend_1h = calculateSuperTrend(klines1h)

  const isLongTrend =
    ema20_1h.at(-1) > ema50_1h.at(-1) &&
    macd_1h.at(-1)?.MACD > macd_1h.at(-1)?.signal &&
    adx_1h.at(-1)?.adx > 20 &&
    supertrend_1h.at(-1)?.trend === true

  const trendDirection = isLongTrend ? 'long' : 'neutral'

  // === 入场信号识别（15M） ===
  const rsi = RSI.calculate({ period: 14, values: closes15m })
  const boll = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes15m })
  const atr = calculateATR(klines15m).at(-1)

  const lastRsi = rsi.at(-1)
  const lastBoll = boll.at(-1)
  const patterns = detectCandlestickPatterns(klines15m)
  const volumeSignal = interpretVolumePrice(klines15m)

  const sr = detectSupportResistanceV2(klines15m)
  const support = sr.supportLevels.at(-1)?.level
  const resistance = sr.resistanceLevels.at(0)?.level

  let entrySignal = false
  let entryReasons = []

  if (lastRsi < 35) {
    entrySignal = true
    entryReasons.push('RSI < 35（超卖）')
  }

  if (price < lastBoll.lower) {
    entrySignal = true
    entryReasons.push('跌破下轨（布林反弹可能）')
  }

  if (patterns.length) {
    entrySignal = true
    entryReasons.push('K线形态：' + patterns.join(' + '))
  }

  if (volumeSignal.includes('放量上涨')) {
    entrySignal = true
    entryReasons.push(volumeSignal)
  }

  const sltp = getTPandSL({
    currentPrice: price,
    direction: 'long',
    atr,
    atrMultiplierTP: 2.2,
    atrMultiplierSL: 1.2
  })

  const suggestion = entrySignal && trendDirection === 'long'
    ? (lastRsi < 30 ? '建议中仓进场波段做多' : '轻仓试多，注意确认回踩')
    : '建议观望，等待更优入场点'
  
  return {
    time: new Date().toLocaleString(),
    symbol,
    mode: 'swing',
    trendDirection, // 趋势方向
    entrySignal, // 入场信号
    entryReasons, //入场理由
    currentPrice: price, // 当前价格
    support, // 支撑
    resistance,// 阻力
    ...sltp,// 止盈止损
    suggestion // 建议
  }
}
