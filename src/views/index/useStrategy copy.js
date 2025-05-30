// 技术指标分析与交易策略模块
import { EMA, SMA, MACD, RSI, BollingerBands, StochasticRSI } from 'technicalindicators'

// 计算技术指标
function calculateMACD(closes) {
  return MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
}

function calculateRSI(closes, period = 14) {
  return RSI.calculate({ period, values: closes });
}

function calculateBollingerBands(closes, period = 20, stdDev = 2) {
  return BollingerBands.calculate({ period, stdDev, values: closes });
}

function calculateSMA(closes, period = 20) {
  return SMA.calculate({ period, values: closes });
}

function calculateEMA(closes, period = 9) {
  return EMA.calculate({ period, values: closes });
}

function calculateStochasticRSI(closes, rsiPeriod = 14, stochasticPeriod = 14, kPeriod = 3, dPeriod = 3) {
  return StochasticRSI.calculate({ values: closes, rsiPeriod, stochasticPeriod, kPeriod, dPeriod });
}

export const useStrategy = (klines, symbol) => {
  const closes = klines.map(k => k.close)

  // 计算技术指标
  const macd = calculateMACD(closes);
  const rsi = calculateRSI(closes);
  const boll = calculateBollingerBands(closes);
  const sma = calculateSMA(closes);
  const ema = calculateEMA(closes);
  const stochasticRsi = calculateStochasticRSI(closes);

  // 获取最新值
  const lastMACD = macd.at(-1) // 最后一个MACD值
  const lastRSI = rsi.at(-1)
  const lastBoll = boll.at(-1)
  const lastEMA = ema.at(-1)
  const lastSMA = sma.at(-1)
  const lastStoch = stochasticRsi.at(-1)
  const current = closes.at(-1) // 当前价格

  // 输出分析结果
  let suggestions = {};
  suggestions.time = `[${new Date().toLocaleString()}] 正在分析${symbol}...`
  if (lastMACD) {
    if (lastMACD.MACD > lastMACD.signal) {
      const msg = `📈 MACD 金叉：当前 MACD=${lastMACD.MACD.toFixed(4)} > Signal=${lastMACD.signal.toFixed(4)}，趋势向上，建议关注买入机会`;
      console.log(msg);
      suggestions.MACD = msg
    } else if (lastMACD.MACD < lastMACD.signal) {
      const msg = `📉 MACD 死叉：当前 MACD=${lastMACD.MACD.toFixed(4)} < Signal=${lastMACD.signal.toFixed(4)}，可能下跌，谨慎持仓`;
      console.log(msg);
      suggestions.MACD = msg
    } else {
      const msg = `📊 MACD 震荡：当前 MACD=${lastMACD.MACD.toFixed(4)} = Signal=${lastMACD.signal.toFixed(4)}，市场可能处于震荡状态`;
      console.log(msg);
      suggestions.MACD = msg
    }
  }

  const msgBase = `当前 RSI=${lastRSI.toFixed(3)}，`;
  if (lastRSI > 70) {
    const msg = `⚠️ RSI 超买：${msgBase}大于70，市场可能处于高位，考虑卖出或观望,卖出建议 - RSI 超买`;
    console.log(msg);
    suggestions.RSI = msg
  } else if (lastRSI < 30) {
    const msg = `✅ RSI 超卖：${msgBase}低于30，市场可能超跌反弹，关注买入机会,买入建议 - RSI 超卖`;
    console.log(msg);
    suggestions.RSI = msg
  } else {
    const msg = `RSI 正常：${msgBase}处于30-70之间，市场可能处于正常趋势`;
    console.log(msg);
    suggestions.RSI = msg
  }

  if (lastBoll && current) {
    if (current > lastBoll.upper) {
      const msg = `⚠️ Boll 突破布林带上轨：当前价格=${current} > 上轨=${lastBoll.upper.toFixed(3)}，市场可能过热，注意回调风险,卖出建议 - 布林带上轨突破`;
      console.log(msg);
      suggestions.Boll = msg
    } else if (current < lastBoll.lower) {
      const msg = `✅ Boll 跌破布林带下轨：当前价格=${current} < 下轨=${lastBoll.lower.toFixed(3)}，市场或将反弹，关注反转信号,买入建议 - 布林带下轨跌破`;
      console.log(msg);
      suggestions.Boll = msg
    } else {
      const msg = `Boll 价格处于布林带内：当前价格=${current}，处于布林带内，市场可能处于正常趋势`;
      console.log(msg);
      suggestions.Boll = msg
    }
  }

  if (lastSMA !== undefined) {
    if (current > lastSMA) {
      const msg = `✅ SMA 均线上方运行：当前价格=${current} > 均线=${lastSMA.toFixed(3)}，多头趋势，考虑逢低吸纳,买入偏好 - 站上SMA均线`;
      console.log(msg);
      suggestions.SMA = msg
    } else {
      const msg = `⚠️ SMA 均线下方运行：当前价格=${current} < 均线=${lastSMA.toFixed(3)}，空头趋势，注意控制风险,卖出偏好 - 跌破SMA均线`;
      console.log(msg);
      suggestions.SMA = msg
    }
  }

  if (lastEMA !== undefined) {
    if (current > lastEMA) {
      const msg = `✅ EMA 上穿：当前价格=${current} > EMA=${lastEMA.toFixed(3)}，多头趋势，考虑逢低吸纳,买入偏好 - 站上EMA均线`;
      console.log(msg);
      suggestions.EMA = msg
    } else {
      const msg = `⚠️ EMA 下穿：当前价格=${current} < EMA=${lastEMA.toFixed(3)}，空头趋势，注意控制风险,卖出偏好 - 跌破EMA均线`;
      console.log(msg);
      suggestions.EMA = msg
    }
  }

  if (lastStoch && lastStoch.k !== undefined && lastStoch.d !== undefined) {
    if (lastStoch.k < 0.2 && lastStoch.d < 0.2) {
      const msg = `✅ 随机RSI 超卖：K线=${lastStoch.k.toFixed(3)}，D线=${lastStoch.d.toFixed(3)}，可能处于超卖状态，考虑买入`;
      console.log(msg);
      suggestions.StochasticRSI = msg
    } else if (lastStoch.k > 0.8 && lastStoch.d > 0.8) {
      const msg = `⚠️ 随机RSI 超买：K线=${lastStoch.k.toFixed(3)}，D线=${lastStoch.d.toFixed(3)}，可能处于超买状态，考虑卖出`;
      console.log(msg);
      suggestions.StochasticRSI = msg
    } else {
      const msg = `随机RSI 正常：K线=${lastStoch.k.toFixed(3)}，D线=${lastStoch.d.toFixed(3)}，市场可能处于正常趋势`;
      console.log(msg);
      suggestions.StochasticRSI = msg
    }
  }

  // === 评分系统开始 ===
  let longScore = 0
  let shortScore = 0

  // MACD
  if (lastMACD?.MACD > lastMACD?.signal) longScore += 2
  else if (lastMACD?.MACD < lastMACD?.signal) shortScore += 2

  // RSI
  if (lastRSI > 70) shortScore += 1
  else if (lastRSI < 30) longScore += 1

  // Bollinger
  if (current > lastBoll?.upper) shortScore += 1
  else if (current < lastBoll?.lower) longScore += 1

  // EMA
  if (current > lastEMA) longScore += 1
  else if (current < lastEMA) shortScore += 1

  // SMA
  if (current > lastSMA) longScore += 1
  else if (current < lastSMA) shortScore += 1

  // Stochastic RSI
  if (lastStoch?.k < 0.2 && lastStoch?.d < 0.2) longScore += 1
  else if (lastStoch?.k > 0.8 && lastStoch?.d > 0.8) shortScore += 1

  // 得出最终策略建议
  const totalScore = longScore - shortScore
  let strategySignal = ''
  let entryPoint = ''
  if (totalScore >= 3) {
    const ema20 = EMA.calculate({ period: 20, values: closes });
    const lastEMA20 = ema20[ema20.length - 1];
    const recentLow = Math.min(...klines.slice(-10).map(k => k.low));
    const support = Math.min(lastEMA20, recentLow, lastSMA);
    entryPoint = `</br>👆 <strong>做多</strong>参考点位：若价格回踩不跌破 <strong>${support.toFixed(3)}</strong> 美元，可考虑在此附近分批做多`
    strategySignal = `📈 策略建议：当前多头信号强烈，建议考虑做多（Long）\n${entryPoint}`
  } else if (totalScore <= -3) {
    const resistance = Math.max(lastEMA, lastSMA, lastBoll?.upper || 0)
    entryPoint = `</br>👇 <strong>做空</strong>参考点位：若价格反弹至 <strong>${resistance.toFixed(3)}</strong> 美元附近承压，可考虑轻仓做空`
    strategySignal = `📉 策略建议：当前空头信号明显，建议考虑做空（Short）\n${entryPoint}`
  } else {
    strategySignal = `🤔 策略建议：信号不明朗，建议观望`
  }
  suggestions.strategy = `${strategySignal}（多头分=${longScore}，空头分=${shortScore}），`
  // === 评分系统结束 ===


  // 分析K线结构
  const patterns = detectCandlestickPatterns(klines);
  if (patterns.length) {
    suggestions.structure = patterns.join('，');
  } else {
    suggestions.structure = 'K线结构无明显信号';
  }

  // 分析量价
  const volumePrice = interpretVolumePrice(klines);
  suggestions.strategy += `</br>${volumePrice}`

  // 支撑/压力位
  const supportLevel = Math.min(...closes.slice(-20)); // 最近20根K线最低收盘价
  const resistanceLevel = Math.max(...closes.slice(-20)); // 最近20根K线最高收盘价
  suggestions.strategy += `<br/>📌 当前支撑位：<strong>${supportLevel.toFixed(3)}</strong>，压力位：<strong>${resistanceLevel.toFixed(3)}</strong>，`

  // 根据方向生成止盈止损点位
  if (lastMACD && lastMACD.MACD > lastMACD.signal) {
    const { takeProfit, stopLoss } = getTPandSL(current, 'long');
    suggestions.strategy += `<br><strong>当前价格：${current}，止盈：${takeProfit}，止损：${stopLoss}</strong>，`;
  } else if (lastMACD && lastMACD.MACD < lastMACD.signal) {
    const { takeProfit, stopLoss } = getTPandSL(current, 'short');
    suggestions.strategy += `<br><strong>当前价格：${current}，止盈：${takeProfit}，止损：${stopLoss}</strong>，`;
  }
  // 5. 返回统一结构
  return suggestions
}

// 量价判断
function interpretVolumePrice(klines) {
  const last = klines.at(-1)
  const prev = klines.at(-2)

  const priceChange = last.close - prev.close
  const volumeChange = last.volume - prev.volume
  const direction = priceChange > 0 ? '涨' : '跌'
  const volume = volumeChange > 0 ? '放量' : '缩量'

  if (direction === '涨' && volume === '放量') return '📈 放量上涨：主力可能真拉，趋势延续概率高，考虑做多（顺势）'
  if (direction === '涨' && volume === '缩量') return '⚠️ 缩量上涨：信心不足，可能是弱反弹，谨慎观望，勿追涨'
  if (direction === '跌' && volume === '放量') return '📉 放量下跌：恐慌或主力出货，考虑做空或止损离场'
  if (direction === '跌' && volume === '缩量') return '🛑 缩量下跌：抛压减轻，或酝酿反弹，谨慎试多'

  return '🤔 无明确量价信号'
}

// 建议止盈 / 止损比例
function getTPandSL(currentPrice, direction = 'long') {
  const takeProfitRate = 0.03  // 止盈3%
  const stopLossRate = 0.015   // 止损1.5%
  if (direction === 'long') {
    return {
      takeProfit: (currentPrice * (1 + takeProfitRate)).toFixed(3),
      stopLoss: (currentPrice * (1 - stopLossRate)).toFixed(3)
    }
  } else {
    return {
      takeProfit: (currentPrice * (1 - takeProfitRate)).toFixed(3),
      stopLoss: (currentPrice * (1 + stopLossRate)).toFixed(3)
    }
  }
}

// K线结构识别函数
function detectCandlestickPatterns(klines) {
  if (klines.length < 2) return [];

  const last = klines[klines.length - 1];
  const prev = klines[klines.length - 2];
  const patterns = [];

  const bodySize = Math.abs(last.close - last.open);
  const totalRange = last.high - last.low;
  const upperShadow = last.high - Math.max(last.close, last.open);
  const lowerShadow = Math.min(last.close, last.open) - last.low;

  // Hammer 检测（实体在上部，长下影线）
  if (
    bodySize / totalRange < 0.4 &&
    lowerShadow > bodySize * 2 &&
    upperShadow < bodySize
  ) {
    patterns.push('锤子线 🔨（可能反转）');
  }

  // Bullish Engulfing（多头吞没）
  if (
    prev.close < prev.open && // 前一根是阴线
    last.close > last.open && // 当前是阳线
    last.open < prev.close &&
    last.close > prev.open
  ) {
    patterns.push('多头吞没 🟢（强烈反转信号）');
  }

  // Bearish Engulfing（空头吞没）
  if (
    prev.close > prev.open && // 前一根是阳线
    last.close < last.open && // 当前是阴线
    last.open > prev.close &&
    last.close < prev.open
  ) {
    patterns.push('空头吞没 🔴（下跌信号）');
  }

  // Doji（十字星）——开收几乎相等，代表犹豫/转折
  if (bodySize < (totalRange * 0.1)) {
    patterns.push('十字星 ✳️（可能变盘）');
  }

  return patterns;
}