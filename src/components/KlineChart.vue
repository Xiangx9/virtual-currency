<!-- 主K线图组件 -->
<template>
  <div ref="chartContainer" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { CandlestickSeries, createChart } from 'lightweight-charts'

// 接收 props
const props = defineProps({
  symbol: { type: String, default: 'btcusdt' },
  interval: { type: String, default: '15m' },
  supportLevels: { type: Array, default: () => [] },
  resistanceLevels: { type: Array, default: () => [] },
  indicators: { type: Array, default: () => [] },
  signals: { type: Array, default: () => [] } // 新增策略信号支持
})

const chartContainer = ref(null)
let chart = null
let candleSeries = null
let ws = null
let klineMap = new Map()
let priceLines = []

// 初始化图表
function initChart() {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
    layout: { background: { color: '#fff' }, textColor: '#333' },
    grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
    timeScale: { timeVisible: true, secondsVisible: true }
  })

  candleSeries = typeof chart.addCandlestickSeries === 'function'
    ? chart.addCandlestickSeries()
    : chart.addSeries(CandlestickSeries)
}


// 加载历史K线数据
async function loadHistory() {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${props.symbol.toUpperCase()}&interval=${props.interval}&limit=300`
    const res = await fetch(url)
    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('K线历史数据格式异常')
    }

    klineMap.clear()
    const candles = data.map(k => {
      const candle = {
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4])
      }
      klineMap.set(candle.time, candle)
      return candle
    })

    candleSeries?.setData(candles)
    chart?.timeScale().fitContent()
  } catch (error) {
    console.error('加载K线历史数据失败:', error)
    candleSeries?.setData([])
  }
}

// 启动 WebSocket 实时更新
function startWebSocket() {
  ws?.close()
  const streamName = `${props.symbol.toLowerCase()}@kline_${props.interval}`
  const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`
  ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.k) {
      const k = data.k
      const candle = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c)
      }
      klineMap.set(candle.time, candle)

      const sorted = Array.from(klineMap.values()).sort((a, b) => a.time - b.time)
      candleSeries?.setData(sorted)
    }
  }

  ws.onerror = (error) => {
    console.error('K线 WebSocket 连接异常:', error)
  }
}

function clearPriceLines() {
  if (!candleSeries) return

  priceLines.forEach((line) => {
    candleSeries.removePriceLine(line)
  })
  priceLines = []
}

function renderPriceLines() {
  if (!candleSeries) return

  clearPriceLines()

  props.supportLevels.forEach((level, index) => {
    const price = Number(level)
    if (!Number.isFinite(price)) return

    const line = candleSeries.createPriceLine({
      price,
      color: '#16a34a',
      lineWidth: index === 0 ? 2 : 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: index === 0 ? '关键支撑' : `支撑${index + 1}`
    })
    priceLines.push(line)
  })

  props.resistanceLevels.forEach((level, index) => {
    const price = Number(level)
    if (!Number.isFinite(price)) return

    const line = candleSeries.createPriceLine({
      price,
      color: '#dc2626',
      lineWidth: index === 0 ? 2 : 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: index === 0 ? '关键阻力' : `阻力${index + 1}`
    })
    priceLines.push(line)
  })
}

function cleanup() {
  clearPriceLines()
  ws?.close()
  ws = null
  chart?.remove()
  chart = null
  candleSeries = null
  klineMap.clear()
}

async function rebuildChart() {
  cleanup()
  await nextTick()
  initChart()
  await loadHistory()
  renderPriceLines()
  startWebSocket()
}

// 当 symbol 或 interval 变化，重新加载图表
watch(() => [props.symbol, props.interval], async () => {
  await rebuildChart()
})

watch(
  () => [props.supportLevels, props.resistanceLevels],
  () => {
    renderPriceLines()
  },
  { deep: true }
)

function resizeChart() {
  if (chart && chartContainer.value) {
    chart.resize(chartContainer.value.clientWidth, chartContainer.value.clientHeight)
  }
}

onMounted(async () => {
  await rebuildChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  cleanup()
})
</script>
