// /utils/strategies.js
import { generateCrossoverSignals } from './generateCrossoverSignals'

export const strategyList = [
  { label: '均线交叉 (EMA5/EMA20)', value: 'emaCross' },
  { label: '均线交叉 (MA5/MA20)', value: 'maCross' }
]

export function generateSignalsByStrategy(data, strategyKey) {
  switch (strategyKey) {
    case 'emaCross':
      return generateCrossoverSignals(data, 5, 20, 'EMA')
    case 'maCross':
      return generateCrossoverSignals(data, 5, 20, 'MA')
    default:
      return []
  }
}
