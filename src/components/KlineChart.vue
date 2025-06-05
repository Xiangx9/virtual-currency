<!-- 主K线图组件 -->
<template>
  <div ref="chartContainer" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { createChart } from 'lightweight-charts'

// 接收 props
const props = defineProps({
  symbol: { type: String, default: 'btcusdt' },
  interval: { type: String, default: '15m' },
  indicators: { type: Array, default: () => [] },
  signals: { type: Array, default: () => [] } // 新增策略信号支持
})

const chartContainer = ref(null)
let chart = null
let candleSeries = null
let ws = null
let klineMap = new Map()
let indicatorSeriesMap = new Map()

// 初始化图表
function initChart() {
  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
    layout: { background: { color: '#fff' }, textColor: '#333' },
    grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
    timeScale: { timeVisible: true, secondsVisible: true }
  })

  candleSeries = chart.addCandlestickSeries()



}


// 加载历史K线数据
async function loadHistory() {
  const url = `https://api.binance.com/api/v3/klines?symbol=${props.symbol.toUpperCase()}&interval=${props.interval}&limit=100`
  const res = await fetch(url)
  const data = await res.json()
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
  candleSeries.setData(candles)
}

// 启动 WebSocket 实时更新
function startWebSocket() {
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
      candleSeries.setData(sorted)
    }
  }
}

function cleanup() {
  ws?.close()
  chart?.remove()
  klineMap.clear()
}

// 当 symbol 或 interval 变化，重新加载图表
watch(() => [props.symbol, props.interval], async () => {
  cleanup()
  initChart()
  await loadHistory()
  startWebSocket()
},)

function resizeChart() {
  if (chart && chartContainer.value) {
    chart.resize(chartContainer.value.clientWidth, chartContainer.value.clientHeight)
  }
}

onMounted(async () => {
  initChart()
  await loadHistory()
  startWebSocket()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  cleanup()
})
</script>
