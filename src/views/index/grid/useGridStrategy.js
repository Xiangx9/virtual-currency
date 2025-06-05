export function useGridStrategy(klines15m, symbol = '资产', gridCount = 5, gridSpacing = 0.02) {
  const price = klines15m.at(-1).close

  const grid = []
  for (let i = 1; i <= gridCount; i++) {
    grid.push({
      buy: +(price * (1 - gridSpacing * i)).toFixed(2),
      sell: +(price * (1 + gridSpacing * i)).toFixed(2),
      takeProfit: +(price * (1 + gridSpacing * i + 0.01)).toFixed(2),
      stopLoss: +(price * (1 - gridSpacing * i - 0.01)).toFixed(2)
    })
  }

  return {
    strategy: 'grid',
    time: new Date().toLocaleString(),
    symbol,
    currentPrice: price,
    gridSuggestion: `当前处于震荡市，推荐执行自动网格策略`,
    grid
  }
}
