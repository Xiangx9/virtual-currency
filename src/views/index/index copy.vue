<template>
  <div>
    <div>
      <KLink></KLink>
    </div>
    <div style="padding: 0 30px;">
      <h1> {{ count }}</h1>
      <el-radio-group v-model="symbol" size="large" @change="RadioChange">
        <el-radio-button label="BTCUSDT" value="BTCUSDT"></el-radio-button>
        <el-radio-button label="ETHUSDT" value="ETHUSDT"></el-radio-button>
        <el-radio-button label="DOGEUSDT" value="DOGEUSDT"></el-radio-button>
      </el-radio-group>
      <div>
        <el-radio-group v-model="interval" @change="RadioChangeM">
          <el-radio-button label="1m" value="1m"></el-radio-button>
          <el-radio-button label="5m" value="5m"></el-radio-button>
          <el-radio-button label="15m" value="15m"></el-radio-button>
          <el-radio-button label="1h" value="1h"></el-radio-button>
          <el-radio-button label="4h" value="4h"></el-radio-button>
          <el-radio-button label="1d" value="1d"></el-radio-button>
        </el-radio-group>
      </div>
      <br>
      <div class="time">{{ DataMsg.time }}</div>
      <br>
      <div>
        <div class="time">趋势类指标(判断方向)</div>
        <h4>EMA(指数移动平均线):</h4><span>{{ DataMsg.EMA }}</span>
        <h4>MACD:</h4><span>{{ DataMsg.MACD }}</span>
        <h4>SMA(简单移动平均线):</h4><span>{{ DataMsg.SMA }}</span>
      </div>
      <br>
      <div>
        <div class="time">震荡类指标(超买超卖)</div>
        <h4>RSI(相对强弱指数):</h4><span>{{ DataMsg.RSI }}</span>
        <h4>Stochastic RSI(随机RSI):</h4><span>{{ DataMsg.StochasticRSI }}</span>
        <h4>Bollinger Bands(布林带):</h4><span>{{ DataMsg.Boll }}</span>
      </div>
      <br>
      <div>
        <div class="time">短线组合</div>
        <h4>EMA + MACD</h4>
        <div>{{ DataMsg.EMA }}</div>
        <div>{{ DataMsg.MACD }}</div>
        <h4>Boll + RSI</h4>
        <div>{{ DataMsg.Boll }}</div>
        <div>{{ DataMsg.RSI }}</div>
        <h4>Stochastic RSI + EMA</h4>
        <div>{{ DataMsg.StochasticRSI }}</div>
        <div>{{ DataMsg.EMA }}</div>
      </div>
      <br>
      <div>
        <div class="time">K线结构分析</div>
        <div>{{ DataMsg.structure }}</div>
      </div>
      <br>
      <div>
        <div class="time">策略建议</div>
        <div v-html="DataMsg.strategy"></div>
      </div>
    </div>
    <div style="height: 50px;"></div>
  </div>
</template>

<script setup>
import './index.scss'
import KLink from '@/components/KLink.vue'
import { useIntervalFn } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'
import { getKline } from './api'
import { useStrategy } from './useStrategy'

let count = ref(0)
const { pause, resume, isActive } = useIntervalFn(() => {
  count.value++
  getKlineData()
}, 60000 * 5)// 5分钟

let symbol = ref('BTCUSDT')
let interval = ref('15m')
let DataMsg = ref({
  time: '', // 时间
  // 趋势类指标(判断方向)
  EMA: '',
  MACD: '',
  SMA: '',
  // 震荡类指标(超买超卖)
  RSI: '',
  StochasticRSI: '',
  Boll: '',
  // 策略建议
  structure: '',
  strategy: '',
  // 支撑/压力位
  support: '',
  resistance: '',

})
const getKlineData = async () => {
  try {
    let pram = {
      symbol: symbol.value,
      interval: interval.value,
    }
    const res = await getKline(pram)
    analyze(res.data)
  } catch (error) {

  }
}

const analyze = async (KlineData,) => {
  const klines = KlineData.map(k => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5])
  }));
  const result = useStrategy(klines, symbol.value)
  DataMsg.value = result
}

const RadioChange = () => {
  count.value == 0
  getKlineData()
}
const RadioChangeM = () => {
  interval.value == '15m'
  getKlineData()
}

onMounted(() => {
  getKlineData()
})
onUnmounted(() => {
  pause()
})
</script>

<style scope lang="scss"></style>