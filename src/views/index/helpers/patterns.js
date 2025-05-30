// 识别基本K线形态：锤子线、多头/空头吞没、十字星
export function detectCandlestickPatterns(klines) {
  if (klines.length < 2) return []

  const last = klines[klines.length - 1]
  const prev = klines[klines.length - 2]
  const patterns = []

  const bodySize = Math.abs(last.close - last.open)
  const totalRange = last.high - last.low
  const upperShadow = last.high - Math.max(last.close, last.open)
  const lowerShadow = Math.min(last.close, last.open) - last.low

  // Hammer 检测
  if (
    bodySize / totalRange < 0.4 &&
    lowerShadow > bodySize * 2 &&
    upperShadow < bodySize
  ) {
    patterns.push('锤子线 🔨（可能反转）')
  }

  // Bullish Engulfing
  if (
    prev.close < prev.open &&
    last.close > last.open &&
    last.open < prev.close &&
    last.close > prev.open
  ) {
    patterns.push('多头吞没 🟢（强烈反转信号）')
  }

  // Bearish Engulfing
  if (
    prev.close > prev.open &&
    last.close < last.open &&
    last.open > prev.close &&
    last.close < prev.open
  ) {
    patterns.push('空头吞没 🔴（下跌信号）')
  }

  // Doji
  if (bodySize < (totalRange * 0.1)) {
    patterns.push('十字星 ✳️（可能变盘）')
  }

  return patterns
}
