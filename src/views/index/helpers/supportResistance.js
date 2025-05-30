// 支撑/压力位检测（更精准版）
/**
 * 精准支撑压力位检测
 * 支持Swing High/Low + 聚合相似点位 + minTouches过滤 + fallback机制
 */
export function detectSupportResistanceV2(klines, windowSize = 2, minTouches = 2, thresholdPercent = 0.003) {
  if (!klines || klines.length < windowSize * 2 + 1) {
    return { supportLevels: [], resistanceLevels: [] }
  }

  const supportCandidates = []
  const resistanceCandidates = []

  for (let i = windowSize; i < klines.length - windowSize; i++) {
    const lows = klines.slice(i - windowSize, i + windowSize + 1).map(k => k.low)
    const highs = klines.slice(i - windowSize, i + windowSize + 1).map(k => k.high)

    const isSupport = klines[i].low === Math.min(...lows)
    const isResistance = klines[i].high === Math.max(...highs)

    if (isSupport) supportCandidates.push(klines[i].low)
    if (isResistance) resistanceCandidates.push(klines[i].high)
  }

  const groupSimilar = (levels) => {
    const grouped = []
    const threshold = (level) => level * thresholdPercent

    levels.forEach((level) => {
      let groupedIntoExisting = false
      for (let group of grouped) {
        if (Math.abs(group.level - level) <= threshold(level)) {
          group.level = (group.level * group.count + level) / (group.count + 1)
          group.count += 1
          groupedIntoExisting = true
          break
        }
      }
      if (!groupedIntoExisting) {
        grouped.push({ level, count: 1 })
      }
    })

    return grouped
      .filter(g => g.count >= minTouches)
      .map(g => ({
        level: parseFloat(g.level.toFixed(2)),
        count: g.count
      }))
      .sort((a, b) => a.level - b.level)
  }

  let supportLevels = groupSimilar(supportCandidates)
  let resistanceLevels = groupSimilar(resistanceCandidates)

  // fallback（仅在完全为空时）提供最近的可视水平
  if (resistanceLevels.length === 0 && resistanceCandidates.length > 0) {
    const fallback = Math.max(...resistanceCandidates)
    resistanceLevels.push({ level: parseFloat(fallback.toFixed(2)), count: 1 })
  }

  if (supportLevels.length === 0 && supportCandidates.length > 0) {
    const fallback = Math.min(...supportCandidates)
    supportLevels.push({ level: parseFloat(fallback.toFixed(2)), count: 1 })
  }

  return {
    supportLevels,      // [{ level: 25300.25, count: 3 }, ...]
    resistanceLevels    // 同上
  }
}


