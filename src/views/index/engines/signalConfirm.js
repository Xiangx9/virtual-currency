// 判断是否符合策略开单条件（如双重确认）
export function isBuyConfirmed({ macd, rsi, supertrend, adx }) {
  return (
    macd?.MACD > macd?.signal &&
    rsi < 60 &&
    supertrend?.trend === true &&
    adx?.adx > 20
  )
}

export function isSellConfirmed({ macd, rsi, supertrend, adx }) {
  return (
    macd?.MACD < macd?.signal &&
    rsi > 40 &&
    supertrend?.trend === false &&
    adx?.adx > 20
  )
}
