<script setup>
import { ref, onUnmounted } from 'vue'.
import { wsKline } from './api' // 新增：引入 WebSocket 连接函数

// 新增：保存 WebSocket 实例（用于后续关闭）
let wsInstance = null

// 初始化 WebSocket 连接（替换或补充原有的轮询逻辑）
const initWebSocket = () => {
  // 关闭旧连接（避免重复连接）
  if (wsInstance) {
    wsInstance.close()
  }
  // 构建 Binance WebSocket 订阅路径（根据当前 symbol 和 interval）
  const streamPath = `${symbol.value.toLowerCase()}@kline_${interval.value}`
  wsInstance = wsKline(streamPath) // 调用 api.js 中的 wsKline 并传递路径

  // 接收实时 K线数据
  wsInstance.onmessage = (event) => {
    const realtimeData = JSON.parse(event.data)
    // Binance K线数据结构参考：https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-streams
    if (realtimeData.e === 'kline') {
      const kline = realtimeData.k
      analyze([kline]) // 调用现有分析函数更新数据
    }
  }
}
// 初始化 WebSocket 连接
initWebSocket()


// 新增：组件卸载时关闭 WebSocket（避免内存泄漏）
onUnmounted(() => {
  if (wsInstance) {
    wsInstance.close()
  }
})

</script>