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
import { formatPrice, getPricePrecision } from './helpers/price'

import { getStrategyScore } from './engines/scoring'
import { isBuyConfirmed, isSellConfirmed } from './engines/signalConfirm'


export const useStrategy = (klines, symbol) => {
  const closes = klines.map(k => k.close)
  const current = closes.at(-1)
  const precision = getPricePrecision(symbol, current)
  const distancePercent = (level) => ((level - current) / current) * 100
  const formatDistance = (level) => {
    const distance = distancePercent(level)
    const sign = distance > 0 ? '+' : ''
    return `${sign}${distance.toFixed(2)}%`
  }

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
  const suggestions = signal(last, symbol)
  const buyConfirmed = isBuyConfirmed(last)
  const sellConfirmed = isSellConfirmed(last)

  // 6. 支撑压力位
  const { supportLevels, resistanceLevels } = detectSupportResistanceV2(klines)
  const keySupport = supportLevels
    .filter(item => item.level <= current)
    .sort((a, b) => b.level - a.level || b.count - a.count)[0]
    || supportLevels.sort((a, b) => Math.abs(a.level - current) - Math.abs(b.level - current))[0]
    || { level: current, count: 0 }

  const keyResistance = resistanceLevels
    .filter(item => item.level >= current)
    .sort((a, b) => a.level - b.level || b.count - a.count)[0]
    || resistanceLevels.sort((a, b) => Math.abs(a.level - current) - Math.abs(b.level - current))[0]
    || { level: current, count: 0 }

  // 7. 形态识别 + 量价分析
  const patternText = detectCandlestickPatterns(klines).join('，') || '无明显K线形态'
  const volumeText = interpretVolumePrice(klines)

  // 8. 策略建议输出
  let strategy = ``
  const keySupportText = formatPrice(keySupport.level, symbol)
  const keyResistanceText = formatPrice(keyResistance.level, symbol)
  const currentPriceText = formatPrice(current, symbol)
  const chartSupportLevels = supportLevels
    .filter(item => item.level <= current)
    .sort((a, b) => b.level - a.level || b.count - a.count)
    .slice(0, 3)
    .map(item => item.level)
  const chartResistanceLevels = resistanceLevels
    .filter(item => item.level >= current)
    .sort((a, b) => a.level - b.level || b.count - a.count)
    .slice(0, 3)
    .map(item => item.level)

  let signalLevel = '观望'
  let signalBias = 'neutral'
  let confirmationStatus = '等待确认'

  if (total >= 3 && buyConfirmed) {
    signalLevel = '强多'
    signalBias = 'long'
    confirmationStatus = '多头确认'
    const { takeProfit, stopLoss, takeProfitDesc, stopLossDesc } = getTPandSL({
      currentPrice: last.price,
      direction: 'long',
      atr: last.atr,
      precision
    })
    strategy += `
      <strong>建议做多</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      当前价格：<strong>${currentPriceText}</strong>，短线结构偏强。<br/>
      参考进场：回踩不破 <strong>${keySupportText}</strong> 再考虑跟随。<br/>
      参考止盈：<strong>${formatPrice(takeProfit, symbol)} (${takeProfitDesc})</strong>，参考止损：<strong>${formatPrice(stopLoss, symbol)} (${stopLossDesc})</strong><br/>`
  } else if (total <= -3 && sellConfirmed) {
    signalLevel = '强空'
    signalBias = 'short'
    confirmationStatus = '空头确认'
    const { takeProfit, stopLoss, takeProfitDesc, stopLossDesc } = getTPandSL({
      currentPrice: last.price,
      direction: 'short',
      atr: last.atr,
      precision
    })
    strategy += `
      <strong>建议做空</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      当前价格：<strong>${currentPriceText}</strong>，短线结构偏弱。<br/>
      参考进场：反弹到 <strong>${keyResistanceText}</strong> 附近遇阻后再考虑跟随。<br/>
      参考止盈：<strong>${formatPrice(takeProfit, symbol)} (${takeProfitDesc})</strong>，参考止损：<strong>${formatPrice(stopLoss, symbol)} (${stopLossDesc})</strong><br/>`
  } else if (total >= 2) {
    signalLevel = '偏多'
    signalBias = 'long'
    confirmationStatus = buyConfirmed ? '多头确认' : '偏多待确认'
    strategy += `
      <strong>偏多观望</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      当前价格：<strong>${currentPriceText}</strong>，但确认条件还不完整。<br/>
      重点观察 <strong>${keySupportText}</strong> 是否继续有效，或价格放量突破 <strong>${keyResistanceText}</strong>。`
  } else if (total <= -2) {
    signalLevel = '偏空'
    signalBias = 'short'
    confirmationStatus = sellConfirmed ? '空头确认' : '偏空待确认'
    strategy += `
      <strong>偏空观望</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      当前价格：<strong>${currentPriceText}</strong>，但确认条件还不完整。<br/>
      重点观察 <strong>${keyResistanceText}</strong> 是否压制有效，或价格跌破 <strong>${keySupportText}</strong> 后再跟随。`
  } else {
    strategy += `
      <strong>建议观望</strong>（多头评分：${longScore}，空头评分：${shortScore}）<br/>
      当前价格：<strong>${currentPriceText}</strong>，多空信号接近，暂时没有足够优势。<br/>
      可等待靠近 <strong>${keySupportText}</strong> 或 <strong>${keyResistanceText}</strong> 后再判断。`
  }

  const nearestSupportLevels = supportLevels
    .filter(item => item.level <= current)
    .sort((a, b) => b.level - a.level || b.count - a.count)
    .slice(0, 3)
    .map(item => ({
      ...item,
      level: formatPrice(item.level, symbol),
      distance: formatDistance(item.level)
    }))

  const nearestResistanceLevels = resistanceLevels
    .filter(item => item.level >= current)
    .sort((a, b) => a.level - b.level || b.count - a.count)
    .slice(0, 3)
    .map(item => ({
      ...item,
      level: formatPrice(item.level, symbol),
      distance: formatDistance(item.level)
    }))

  return {
    time: new Date().toLocaleString(),
    symbol,
    suggestions,
    strategy,
    signalLevel,
    signalBias,
    confirmationStatus,
    longScore,
    shortScore,
    patternText,
    volumeText,
    chartSupportLevels,
    chartResistanceLevels,
    supportLevels: nearestSupportLevels,
    resistanceLevels: nearestResistanceLevels,
    numberStr: formatPrice(current, symbol),
    keySupport: keySupportText,
    keyResistance: keyResistanceText
  }
}
