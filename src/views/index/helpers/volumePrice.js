// 用于量价组合判断主力行为
export function interpretVolumePrice(klines) {
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
