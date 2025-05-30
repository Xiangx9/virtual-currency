// 多空评分逻辑模块，用于策略信号强度判断
export function getStrategyScore(indicators) {
  const {
    macd, rsi, boll, ema, sma, stoch, supertrend, adx, obv, mfi, price
  } = indicators

  let longScore = 0
  let shortScore = 0

  // MACD
  if (macd?.MACD > macd?.signal) longScore += 2
  else if (macd?.MACD < macd?.signal) shortScore += 2

  // RSI
  if (rsi > 70) shortScore += 1
  else if (rsi < 30) longScore += 1

  // Bollinger Bands
  if (price > boll?.upper) shortScore += 1
  else if (price < boll?.lower) longScore += 1

  // EMA/SMA
  if (price > ema) longScore += 1
  else shortScore += 1

  if (price > sma) longScore += 1
  else shortScore += 1

  // Stochastic RSI
  if (stoch?.k < 0.2 && stoch?.d < 0.2) longScore += 1
  else if (stoch?.k > 0.8 && stoch?.d > 0.8) shortScore += 1

  // Supertrend
  if (supertrend?.trend) longScore += 1
  else shortScore += 1

  // ADX - 趋势强度，超过25才加权
  if (adx?.adx > 25) {
    if (adx.pdi > adx.mdi) longScore += 1
    else shortScore += 1
  }

  // OBV/MFI（非主导）
  if (obv > 0) longScore += 0.5
  else shortScore += 0.5

  if (mfi > 80) shortScore += 0.5
  else if (mfi < 20) longScore += 0.5

  return { longScore, shortScore, total: longScore - shortScore }
}
