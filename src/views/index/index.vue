<template>
  <div>
    <div>
      <KlineChart :symbol="symbol" :interval="interval"></KlineChart>
    </div>
    <div style="padding: 0 30px;">
      <br>
      <h1 class="time">{{ DataMsg.time }}
        <br>
        第 {{ count }} 次更新
      </h1>
      <br>
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
      <div>
        <NumberFlip :value="DataMsg.numberStr" />
        <div style="display: flex;">
          <NumberFlip :value="DataMsg.keySupport" />
          <h1 class="time"> 支</h1>
        </div>
        <div style="display: flex;">
          <NumberFlip :value="DataMsg.keyResistance" />
          <h1 class="time">阻</h1>
        </div>
      </div>
      <div style="display: flex;flex-wrap: wrap;">
        <div>
          <div class="time">趋势类指标(判断方向)</div>
          <h4>EMA(指数移动平均线):</h4><span>{{ DataMsg.suggestions.EMA }}</span>
          <h4>MACD:</h4><span>{{ DataMsg.suggestions.MACD }}</span>
          <h4>SMA(简单移动平均线):</h4><span>{{ DataMsg.suggestions.SMA }}</span>
        </div>
        <div style="width: 50px;"></div>
        <div>
          <div class="time">震荡类指标(超买超卖)</div>
          <h4>RSI(相对强弱指数):</h4><span>{{ DataMsg.suggestions.RSI }}</span>
          <h4>Stochastic RSI(随机RSI):</h4><span>{{ DataMsg.suggestions.StochasticRSI }}</span>
          <h4>Bollinger Bands(布林带):</h4><span>{{ DataMsg.suggestions.Boll }}</span>
        </div>
        <div style="width: 50px;"></div>
        <div>
          <div class="time">短线组合</div>
          <h4>EMA + MACD</h4>
          <div>{{ DataMsg.suggestions.EMA }}</div>
          <div>{{ DataMsg.suggestions.MACD }}</div>
          <h4>Boll + RSI</h4>
          <div>{{ DataMsg.suggestions.Boll }}</div>
          <div>{{ DataMsg.suggestions.RSI }}</div>
          <h4>Stochastic RSI + EMA</h4>
          <div>{{ DataMsg.suggestions.StochasticRSI }}</div>
          <div>{{ DataMsg.suggestions.EMA }}</div>
        </div>
      </div>
      <br>
      <div style="display: flex;flex-wrap: wrap;">
        <div>
          <div class="time">支撑和阻力</div>
          <div style="display: flex;">
            <div>
              <h4>支撑</h4>
              <div v-for="(item, index) in DataMsg.supportLevels" :key="index"
                :style="{ color: item.count > 10 ? 'red' : '' }">
                <span>{{ item.level }}&nbsp;&nbsp;</span>
                <strong>({{ item.count }}次)</strong>
              </div>
            </div>
            <div style="width: 50px;"></div>
            <div>
              <h4>阻力</h4>
              <div v-for="(item, index) in DataMsg.resistanceLevels" :key="index"
                :style="{ color: item.count > 3 ? 'red' : '' }">
                <span>{{ item.level }}&nbsp;&nbsp;</span>
                <strong>({{ item.count }}次)</strong>
              </div>
            </div>
          </div>
        </div>
        <div style="width: 50px;"></div>
        <div>
          <div class="time">K线结构分析 + 量价分析</div>
          <h4>K线结构分析</h4>
          <div>{{ DataMsg.patternText }}</div>
          <h4>量价分析</h4>
          <div>{{ DataMsg.volumeText }}</div>
          <h4>策略建议</h4>
          <div v-html="DataMsg.strategy"></div>
        </div>
      </div>
    </div>
    <div style="height: 50px;"></div>
  </div>
</template>

<script setup>
import './index.scss'
import KlineChart from '@/components/KlineChart.vue'
import NumberFlip from "@/components/NumberFlip.vue";

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
  suggestions: {},
  supportLevels: [],
  resistanceLevels: [],
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
  console.log(`${symbol.value}分析结果：`, result);

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