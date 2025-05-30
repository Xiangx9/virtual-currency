// 技术指标分析与交易策略模块
import { EMA, SMA, MACD, RSI, BollingerBands, StochasticRSI } from 'technicalindicators'
import { calculateATR } from './indicators/atr'
import { calculateSuperTrend } from './indicators/supertrend'
import { calculateADX } from './indicators/adx'
import { calculateOBV } from './indicators/obv'
import { calculateMFI } from './indicators/mfi'
import { signal } from './indicators/signal'

import { detectCandlestickPatterns } from './helpers/patterns'
import { interpretVolumePrice } from './helpers/volumePrice'
import { getTPandSL } from './helpers/tpSl'
import { detectSupportResistanceV2 } from './helpers/supportResistance'

import { getStrategyScore } from './engines/scoring'
import { isBuyConfirmed, isSellConfirmed } from './engines/signalConfirm'


export const useStrategy = (klines, symbol) => {
  const closes = klines.map(k => k.close)
  const current = closes.at(-1)

  // 计算技术指标
  // 1. 计算常规指标
  const macd = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 })
  const rsi = RSI.calculate({ period: 14, values: closes })
  const boll = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes })
  const sma = SMA.calculate({ period: 20, values: closes })
  const ema = EMA.calculate({ period: 9, values: closes })
  const stoch = StochasticRSI.calculate({ values: closes, rsiPeriod: 14, stochasticPeriod: 14, kPeriod: 3, dPeriod: 3 })

  // 2. 自定义指标
  const atr = calculateATR(klines)
  const supertrendSeries = calculateSuperTrend(klines)
  const adxSeries = calculateADX(klines)
  const obvSeries = calculateOBV(klines)
  const mfiSeries = calculateMFI(klines)

  // 3. 获取最新值
  const last = {
    macd: macd.at(-1),
    rsi: rsi.at(-1),
    boll: boll.at(-1),
    sma: sma.at(-1),
    ema: ema.at(-1),
    stoch: stoch.at(-1),
    atr: atr.at(-1),
    supertrend: supertrendSeries.at(-1),
    adx: adxSeries.at(-1),
    obv: obvSeries.at(-1),
    mfi: mfiSeries.at(-1),
    price: current
  }
  // 4. 多空评分
  const { longScore, shortScore, total } = getStrategyScore(last)
  // 5. 信号确认
  const suggestions = signal(last)
  const buyConfirmed = isBuyConfirmed(last)
  const sellConfirmed = isSellConfirmed(last)

  // 6. 支撑压力位
  const { supportLevels, resistanceLevels } = detectSupportResistanceV2(klines)
  console.log("关键支撑：", supportLevels.map(s => `${s.level} (${s.count}次)`))
  console.log("关键压力：", resistanceLevels.map(r => `${r.level} (${r.count}次)`))

  // 7. 形态识别 + 量价分析
  const patternText = detectCandlestickPatterns(klines).join('，') || '无明显K线形态'
  const volumeText = interpretVolumePrice(klines)

  // 8. 策略建议输出
  let strategy = ``
  if (total >= 3 && buyConfirmed) {
    // const { takeProfit, stopLoss } = getTPandSL(current, 'long')
    const { takeProfit, stopLoss, takeProfitDesc, stopLossDesc } = getTPandSL({
      currentPrice: last.price,
      direction: 'long',
      atr: last.atr
    })
    strategy += `
      📈 <strong>建议做多</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      参考进场：若价格不跌破 <strong>${keySupport.toFixed(3)}</strong><br/>
      止盈：<strong>${takeProfit} (${takeProfitDesc})</strong>，止损：<strong>${stopLoss} (${stopLossDesc})</strong><br/>`
  } else if (total <= -3 && sellConfirmed) {
    // const { takeProfit, stopLoss } = getTPandSL(current, 'short')
    const { takeProfit, stopLoss, takeProfitDesc, stopLossDesc } = getTPandSL({
      currentPrice: last.price,
      direction: 'short',
      atr: last.atr
    })
    strategy += `
      📉 <strong>建议做空</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      参考进场：若价格在 <strong>${keyResistance.toFixed(3)}</strong> 遇阻<br/>
      止盈：<strong>${takeProfit} (${takeProfitDesc})</strong>，止损：<strong>${stopLoss} (${stopLossDesc})</strong><br/>`
  } else {
    strategy += `
      🤔 <strong>建议观望</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      当前信号不明朗，请耐心等待机会`
  }

  return {
    time: new Date().toLocaleString(),
    symbol,
    suggestions,
    strategy,
    patternText,
    volumeText,
    supportLevels,
    resistanceLevels
  }
}
