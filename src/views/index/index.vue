<template>
  <div>
    <div>
      <KlineChart :symbol="symbol" :interval="interval" :support-levels="DataMsg.chartSupportLevels"
        :resistance-levels="DataMsg.chartResistanceLevels"></KlineChart>
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
      <div class="refresh-toolbar">
        <div class="refresh-status">
          <span class="refresh-label">自动刷新</span>
          <el-switch v-model="autoRefreshEnabled" @change="handleAutoRefreshChange" />
          <span class="refresh-countdown">
            {{ autoRefreshEnabled ? `${refreshCountdown}s 后刷新` : '已暂停自动刷新' }}
          </span>
        </div>
        <el-button type="primary" plain :loading="loading" @click="manualRefresh">
          立即刷新
        </el-button>
      </div>
      <br>
      <div>
        <NumberFlip :value="DataMsg.numberStr" />
        <div class="time"
          :style="{ color: DataMsg.signalBias === 'long' ? '#16a34a' : DataMsg.signalBias === 'short' ? '#dc2626' : '#333' }">
          信号等级：{{ DataMsg.signalLevel || '观望' }}
        </div>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">确认状态</div>
            <div class="summary-value">{{ DataMsg.confirmationStatus || '等待确认' }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">多空评分</div>
            <div class="summary-value">多头 {{ DataMsg.longScore ?? 0 }} / 空头 {{ DataMsg.shortScore ?? 0 }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">关键区间</div>
            <div class="summary-value">{{ DataMsg.keySupport || '--' }} - {{ DataMsg.keyResistance || '--' }}</div>
          </div>
        </div>
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
              <div v-for="(item, index) in DataMsg.supportLevels" :key="index" class="level-item"
                :style="{ borderColor: index === 0 ? '#16a34a' : '#dbeafe' }">
                <span>{{ item.level }}</span>
                <strong>{{ item.distance }}</strong>
                <span>({{ item.count }}次)</span>
              </div>
            </div>
            <div style="width: 50px;"></div>
            <div>
              <h4>阻力</h4>
              <div v-for="(item, index) in DataMsg.resistanceLevels" :key="index" class="level-item"
                :style="{ borderColor: index === 0 ? '#dc2626' : '#fee2e2' }">
                <span>{{ item.level }}</span>
                <strong>{{ item.distance }}</strong>
                <span>({{ item.count }}次)</span>
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

const refreshIntervalSeconds = 300
let count = ref(0)
let autoRefreshEnabled = ref(true)
let refreshCountdown = ref(refreshIntervalSeconds)
let loading = ref(false)

const { pause, resume } = useIntervalFn(() => {
  if (loading.value) return
  refreshCountdown.value -= 1
  if (refreshCountdown.value <= 0) {
    count.value++
    getKlineData()
  }
}, 1000, { immediate: false })

let symbol = ref('BTCUSDT')
let interval = ref('15m')
let DataMsg = ref({
  time: '', // 时间
  suggestions: {},
  supportLevels: [],
  resistanceLevels: [],
  chartSupportLevels: [],
  chartResistanceLevels: [],
  signalLevel: '观望',
  signalBias: 'neutral',
  confirmationStatus: '等待确认',
  longScore: 0,
  shortScore: 0,
})
const getKlineData = async () => {
  if (loading.value) return
  try {
    loading.value = true
    let pram = {
      symbol: symbol.value,
      interval: interval.value,
    }
    const res = await getKline(pram)
    analyze(res.data)
  } catch (error) {
    console.error('获取K线数据失败:', error)
  } finally {
    loading.value = false
    refreshCountdown.value = refreshIntervalSeconds
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
  count.value = 0
  getKlineData()
}
const RadioChangeM = () => {
  count.value = 0
  getKlineData()
}

const manualRefresh = () => {
  if (loading.value) return
  count.value++
  getKlineData()
}

const handleAutoRefreshChange = (value) => {
  if (value) {
    refreshCountdown.value = refreshIntervalSeconds
    resume()
  } else {
    pause()
  }
}

onMounted(() => {
  getKlineData()
  if (autoRefreshEnabled.value) {
    resume()
  }
})
onUnmounted(() => {
  pause()
})
</script>

<style scope lang="scss"></style>
