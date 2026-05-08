
import { formatPrice } from '../helpers/price'

export function signal(last, symbol) {
  let suggestions = {}
  const priceText = formatPrice(last.price, symbol)

  // === MACD 信号 ===
  if (last.macd) {
    if (last.macd.MACD > last.macd.signal) {
      suggestions.MACD = `MACD 金叉：${last.macd.MACD.toFixed(4)} > ${last.macd.signal.toFixed(4)}，短线动能偏强，可结合支撑位等待回踩确认。`
    } else if (last.macd.MACD < last.macd.signal) {
      suggestions.MACD = `MACD 死叉：${last.macd.MACD.toFixed(4)} < ${last.macd.signal.toFixed(4)}，短线动能偏弱，反弹时更适合观察压力位表现。`
    } else {
      suggestions.MACD = `MACD 震荡：MACD=${last.macd.MACD.toFixed(4)}，Signal=${last.macd.signal.toFixed(4)}，方向性一般，暂不宜单独据此追单。`
    }
  }
  
  // === RSI 信号 ===
  if (last.rsi !== undefined) {
    const msgBase = `当前 RSI=${last.rsi.toFixed(3)}，`
    if (last.rsi > 70) {
      suggestions.RSI = `RSI 超买：${msgBase}大于 70，价格容易出现回撤，追多要等待重新回到强势区间。`
    } else if (last.rsi < 30) {
      suggestions.RSI = `RSI 超卖：${msgBase}低于 30，存在技术反弹机会，但更适合等待企稳后再考虑介入。`
    } else {
      suggestions.RSI = `RSI 中性：${msgBase}处于 30-70 区间，市场暂未进入极端状态。`
    }
  }
  
  // === Bollinger Band 信号 ===
  if (last.boll && last.price !== undefined) {
    if (last.price > last.boll.upper) {
      suggestions.Boll = `布林带上轨外：现价 ${priceText} 高于上轨 ${formatPrice(last.boll.upper, symbol)}，短线偏热，留意冲高回落。`
    } else if (last.price < last.boll.lower) {
      suggestions.Boll = `布林带下轨外：现价 ${priceText} 低于下轨 ${formatPrice(last.boll.lower, symbol)}，短线偏弱，但有反抽修复可能。`
    } else {
      suggestions.Boll = `布林带正常：现价 ${priceText} 仍在通道内，波动节奏相对稳定。`
    }
  }
  
  // === SMA 均线位置 ===
  if (last.sma !== undefined) {
    if (last.price > last.sma) {
      suggestions.SMA = `SMA 上方：现价 ${priceText} 高于均线 ${formatPrice(last.sma, symbol)}，中短线仍偏多。`
    } else {
      suggestions.SMA = `SMA 下方：现价 ${priceText} 低于均线 ${formatPrice(last.sma, symbol)}，中短线仍偏空。`
    }
  }
  
  // === EMA 均线位置 ===
  if (last.ema !== undefined) {
    if (last.price > last.ema) {
      suggestions.EMA = `EMA 上方：现价 ${priceText} 高于 EMA ${formatPrice(last.ema, symbol)}，短线趋势维持偏强。`
    } else {
      suggestions.EMA = `EMA 下方：现价 ${priceText} 低于 EMA ${formatPrice(last.ema, symbol)}，短线趋势仍偏弱。`
    }
  }
  
  // === Stochastic RSI ===
  if (last.stoch && last.stoch.k !== undefined && last.stoch.d !== undefined) {
    if (last.stoch.k < 0.2 && last.stoch.d < 0.2) {
      suggestions.StochasticRSI = `Stoch RSI 超卖：K=${last.stoch.k.toFixed(3)}, D=${last.stoch.d.toFixed(3)}，短线有反弹条件，但最好配合放量或站回均线。`
    } else if (last.stoch.k > 0.8 && last.stoch.d > 0.8) {
      suggestions.StochasticRSI = `Stoch RSI 超买：K=${last.stoch.k.toFixed(3)}, D=${last.stoch.d.toFixed(3)}，高位回落风险增大，追涨性价比一般。`
    } else {
      suggestions.StochasticRSI = `Stoch RSI 中性：K=${last.stoch.k.toFixed(3)}, D=${last.stoch.d.toFixed(3)}，暂未形成强烈拐点信号。`
    }
  }
  return suggestions; // 返回建议对象，包含每个指标的信号信息。
}
