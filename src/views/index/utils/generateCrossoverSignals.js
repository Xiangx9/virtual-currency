// 传入价格数据和参数，生成买卖信号 [{ time: 秒, type: 'buy'|'sell' }]
export function generateCrossoverSignals(data, shortPeriod = 5, longPeriod = 20, mode = 'MA') {
  const getMA = (arr, period) => {
    return arr.map((_, i) => {
      if (i < period - 1) return null
      const sum = arr.slice(i - period + 1, i + 1).reduce((acc, cur) => acc + cur.close, 0)
      return sum / period
    })
  }

  const getEMA = (arr, period) => {
    const result = []
    let emaPrev = arr[0].close
    const multiplier = 2 / (period + 1)
    for (let i = 0; i < arr.length; i++) {
      const close = arr[i].close
      const ema = i === 0 ? close : (close - emaPrev) * multiplier + emaPrev
      emaPrev = ema
      result.push(ema)
    }
    return result
  }

  const shortLine = mode === 'EMA' ? getEMA(data, shortPeriod) : getMA(data, shortPeriod)
  const longLine = mode === 'EMA' ? getEMA(data, longPeriod) : getMA(data, longPeriod)

  const signals = []

  for (let i = 1; i < data.length; i++) {
    if (!shortLine[i - 1] || !longLine[i - 1]) continue

    const prevDiff = shortLine[i - 1] - longLine[i - 1]
    const currDiff = shortLine[i] - longLine[i]

    if (prevDiff <= 0 && currDiff > 0) {
      signals.push({ time: data[i].time, type: 'buy' })
    } else if (prevDiff >= 0 && currDiff < 0) {
      signals.push({ time: data[i].time, type: 'sell' })
    }
  }

  return signals
}
