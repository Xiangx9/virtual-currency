/**
 * 支持固定比例或基于 ATR 的止盈止损计算器
 * @param {Object} params
 * @param {number} params.currentPrice 当前价格
 * @param {string} params.direction 'long' 或 'short'
 * @param {number} [params.takeProfitRate] 默认止盈百分比（如 0.03）
 * @param {number} [params.stopLossRate] 默认止损百分比（如 0.015）
 * @param {number} [params.atr] 可选：最近 ATR 值
 * @param {number} [params.atrMultiplierTP] 止盈倍数（基于ATR）
 * @param {number} [params.atrMultiplierSL] 止损倍数（基于ATR）
 * @param {number} [params.precision=3] 小数精度
 */
export function getTPandSL({
  currentPrice,
  direction = 'long',
  takeProfitRate = 0.03,
  stopLossRate = 0.015,
  atr, // optional
  atrMultiplierTP = 2,
  atrMultiplierSL = 1.2,
  precision = 3
}) {
  let tp, sl
  const toFixed = (val) => +val.toFixed(precision)

  if (atr) {
    const tpOffset = atr * atrMultiplierTP
    const slOffset = atr * atrMultiplierSL

    if (direction === 'long') {
      tp = toFixed(currentPrice + tpOffset)
      sl = toFixed(currentPrice - slOffset)
    } else {
      tp = toFixed(currentPrice - tpOffset)
      sl = toFixed(currentPrice + slOffset)
    }

    return {
      mode: 'ATR动态',
      direction,
      takeProfit: tp,
      stopLoss: sl,
      takeProfitDesc: `+${atrMultiplierTP} ATR`,
      stopLossDesc: `-${atrMultiplierSL} ATR`
    }
  } else {
    const tpRate = takeProfitRate
    const slRate = stopLossRate

    if (direction === 'long') {
      tp = toFixed(currentPrice * (1 + tpRate))
      sl = toFixed(currentPrice * (1 - slRate))
    } else {
      tp = toFixed(currentPrice * (1 - tpRate))
      sl = toFixed(currentPrice * (1 + slRate))
    }

    return {
      mode: '固定比例',
      direction,
      takeProfit: tp,
      stopLoss: sl,
      takeProfitDesc: `${(tpRate * 100).toFixed(1)}%`,
      stopLossDesc: `${(slRate * 100).toFixed(1)}%`
    }
  }
}
