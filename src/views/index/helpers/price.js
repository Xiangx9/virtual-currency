export function getPricePrecision(symbol, price = 0) {
  const upperSymbol = String(symbol || '').toUpperCase()

  if (upperSymbol.includes('DOGE')) return 4
  if (price >= 1000) return 2
  if (price >= 1) return 3
  return 4
}

export function formatPrice(value, symbol, fallback = '--') {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return fallback

  return numericValue.toFixed(getPricePrecision(symbol, numericValue))
}

export function roundPrice(value, symbol, fallback = 0) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return fallback

  return Number(formatPrice(numericValue, symbol, String(fallback)))
}
