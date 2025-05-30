
export function signal(last) {
  let suggestions = {}

  // === MACD 信号 ===
  if (last.macd) {
    if (last.macd.MACD > last.macd.signal) {
      suggestions.MACD = `📈 MACD 金叉：${last.macd.MACD.toFixed(4)} > ${last.macd.signal.toFixed(4)}，趋势向上，建议关注买入机会`
    } else if (last.macd.MACD < last.macd.signal) {
      suggestions.MACD = `📉 MACD 死叉：${last.macd.MACD.toFixed(4)} < ${last.macd.signal.toFixed(4)}，可能下跌，谨慎持仓`
    } else {
      suggestions.MACD = `📊 MACD 震荡：MACD=${last.macd.MACD.toFixed(4)}，Signal=${last.macd.signal.toFixed(4)}，市场可能处于震荡状态`
    }
  }
  
  // === RSI 信号 ===
  if (last.rsi !== undefined) {
    const msgBase = `当前 RSI=${last.rsi.toFixed(3)}，`
    if (last.rsi > 70) {
      suggestions.RSI = `⚠️ RSI 超买：${msgBase}大于70，市场可能处于高位，考虑卖出或观望`
    } else if (last.rsi < 30) {
      suggestions.RSI = `✅ RSI 超卖：${msgBase}低于30，市场可能超跌反弹，关注买入机会`
    } else {
      suggestions.RSI = `RSI 正常：${msgBase}处于30-70之间，市场可能处于正常趋势`
    }
  }
  
  // === Bollinger Band 信号 ===
  if (last.boll && last.price !== undefined) {
    if (last.price > last.boll.upper) {
      suggestions.Boll = `⚠️ 突破上轨：当前价格=${last.price} > 上轨=${last.boll.upper.toFixed(3)}，市场可能过热，注意回调风险`
    } else if (last.price < last.boll.lower) {
      suggestions.Boll = `✅ 跌破下轨：当前价格=${last.price} < 下轨=${last.boll.lower.toFixed(3)}，市场或将反弹，关注买入`
    } else {
      suggestions.Boll = `Boll 正常：价格在布林带区间内，市场趋势稳定`
    }
  }
  
  // === SMA 均线位置 ===
  if (last.sma !== undefined) {
    if (last.price > last.sma) {
      suggestions.SMA = `✅ SMA 上方：当前价格=${last.price} > 均线=${last.sma.toFixed(3)}，多头趋势`
    } else {
      suggestions.SMA = `⚠️ SMA 下方：当前价格=${last.price} < 均线=${last.sma.toFixed(3)}，空头趋势`
    }
  }
  
  // === EMA 均线位置 ===
  if (last.ema !== undefined) {
    if (last.price > last.ema) {
      suggestions.EMA = `✅ EMA 上方：当前价格=${last.price} > EMA=${last.ema.toFixed(3)}，多头趋势`
    } else {
      suggestions.EMA = `⚠️ EMA 下方：当前价格=${last.price} < EMA=${last.ema.toFixed(3)}，空头趋势`
    }
  }
  
  // === Stochastic RSI ===
  if (last.stoch && last.stoch.k !== undefined && last.stoch.d !== undefined) {
    if (last.stoch.k < 0.2 && last.stoch.d < 0.2) {
      suggestions.StochasticRSI = `✅ Stoch RSI 超卖：K=${last.stoch.k.toFixed(3)}, D=${last.stoch.d.toFixed(3)}，可能反弹，考虑买入`
    } else if (last.stoch.k > 0.8 && last.stoch.d > 0.8) {
      suggestions.StochasticRSI = `⚠️ Stoch RSI 超买：K=${last.stoch.k.toFixed(3)}, D=${last.stoch.d.toFixed(3)}，可能下跌，考虑卖出`
    } else {
      suggestions.StochasticRSI = `Stoch RSI 正常：K=${last.stoch.k.toFixed(3)}, D=${last.stoch.d.toFixed(3)}，震荡行情可能持续`
    }
  }
  return suggestions; // 返回建议对象，包含每个指标的信号信息。
}