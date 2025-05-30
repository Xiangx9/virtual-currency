// OBV - On-Balance Volume（量能方向）
import { OBV } from 'technicalindicators'

export function calculateOBV(klines) {
  const closes = klines.map(k => k.close)
  const volumes = klines.map(k => k.volume)

  return OBV.calculate({
    close: closes,
    volume: volumes
  })
}
