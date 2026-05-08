<!--
  项目在线访问地址 / Live demo:
  https://virtual-currency.pages.dev/
-->

# 虚拟货币量化分析平台 / Virtual Currency Quant Analysis Dashboard

  中文简介：
  本项目是一个基于 Vue 3 的前端量化分析与信号展示平台，集成了常见技术指标（EMA、MACD、RSI、Bollinger 等）、支撑/阻力位检测、K 线形态识别、量价分析、策略评分与多信号确认逻辑。前端通过 Binance 公共 REST/WebSocket 接口拉取行情数据并做本地分析，适合作为策略可视化与信号监控面板。

  English Summary:
  This project is a Vue 3-based front-end dashboard for quantitative analysis and signal visualization. It integrates common technical indicators (EMA, MACD, RSI, Bollinger, etc.), support/resistance detection, candlestick pattern recognition, volume-price analysis, strategy scoring and multi-signal confirmation. The frontend fetches market data from Binance public REST/WebSocket and performs local analysis for strategy visualization and monitoring.

  ---

  **主要功能 / Features:**

- **K 线图展示**: 实时/历史 K 线（`KlineChart.vue`）。
- **技术指标**: EMA、SMA、MACD、RSI、Bollinger、ATR、ADX、OBV、MFI、Supertrend 等。
- **形态与量价分析**: K 线形态识别、量价组合判定。
- **支撑/阻力检测**: 聚合相似点位并按触及次数排序。
- **策略引擎**: 多空评分（`engines/scoring.js`）与信号确认（`engines/signalConfirm.js`）。
- **自动刷新与手动刷新**: 可配置的自动轮询与手动刷新按钮（在首页控制面板）。

  **关键组件 / Key Components:**

# 虚拟货币量化分析平台 / Virtual Currency Quant Analysis Dashboard

访问地址：<https://virtual-currency.pages.dev/>

---

## 项目概览 / Overview

中文：
本项目是一个基于 Vue 3 的前端量化分析与信号展示平台，集成常见技术指标（EMA、MACD、RSI、Bollinger 等）、支撑/阻力位检测、K 线形态识别、量价分析、策略评分与多信号确认逻辑。前端通过 Binance 公共 REST/WebSocket 接口拉取行情数据并做本地分析，适合作为策略可视化与信号监控面板（仅用于信号展示与回测/研究，不构成交易建议）。

English:
This project is a Vue 3 front-end dashboard for quantitative analysis and signal visualization. It combines common technical indicators (EMA, MACD, RSI, Bollinger, etc.), support/resistance detection, candlestick pattern recognition, volume-price analysis, strategy scoring and multi-signal confirmation. The frontend fetches market data from Binance public REST/WebSocket for local analysis and visualization. This project is for monitoring and research only, not financial advice.

---

## 主要功能 / Features

- K 线图展示（`src/components/KlineChart.vue`）：基于 `lightweight-charts`，支持历史与实时数据展示。
- 指标体系：EMA、SMA、MACD、RSI、Bollinger、ATR、ADX、OBV、MFI、Supertrend 等（部分来自 `technicalindicators`，部分为自定义实现）。
- 形态与量价分析：K 线形态识别（锤子线、吞没、十字星等）与量价组合判断（`src/views/index/helpers`）。
- 支撑/阻力检测：聚合相似点位并按触及次数排序，生成关键区间。
- 策略引擎：多空评分（`src/views/index/engines/scoring.js`）与多信号确认逻辑（`signalConfirm.js`），输出建议与确认状态。
- 自动刷新与手动刷新：首页控制面板支持可配置的自动轮询与手动刷新。

---

## 关键组件 / Key Components

- `src/components/KlineChart.vue` — 主图表组件（lightweight-charts）。
- `src/components/NumberFlip.vue` — 数字翻牌展示组件。
- `src/views/index/index.vue` — 首页视图，聚合图表、指标概要与操作控件。
- `src/views/index/useStrategy.js` — 策略计算入口：计算指标、支撑/阻力、信号建议与评分。
- `src/views/index/indicators/` — 指标实现（如 `atr.js`、`supertrend.js`、`adx.js`）。
- `src/views/index/helpers/` — 工具集合（`patterns.js`、`volumePrice.js`、`tpSl.js`、`supportResistance.js`）。
- `src/views/index/engines/` — 引擎模块（`scoring.js`、`signalConfirm.js`）。
- `src/api/axios.js` — axios 实例与拦截器（默认 baseURL 指向 Binance 公共 API）。

---

## 项目结构（节选） / Project Structure (excerpt)

- `src/`
  - `components/`
  - `views/`
    - `index/`
      - `index.vue`
      - `useStrategy.js`
      - `indicators/`
      - `helpers/`
      - `engines/`
      - `api.js`
  - `api/axios.js`
  - `router/`

（完整结构请查看仓库）

---

## 快速开始 / Quick Start

安装依赖：

```powershell
npm install
```

开发模式：

```powershell
npm run dev
```

构建生产包：

```powershell
npm run build
```

本地预览构建结果：

```powershell
npm run preview
```

---

## 配置与环境变量 / Configuration & Env

- `vite.config.js` 使用 `loadEnv` 读取 `.env`（设置代理或第三方地址请在 `.env` 中配置，例如 `VITE_RES_URL`）。
- `src/api/axios.js` 默认 `axios.defaults.baseURL = "https://api.binance.com"`；如需使用代理或 mock，请修改此处。

---

## 核心模块说明 / Core Modules

- `useStrategy(klines, symbol)`：
  - 输入：历史 K 线数组（{open, high, low, close, volume}）与交易对符号。
  - 输出：分析结果对象，包含 `suggestions`（指标建议）、`supportLevels`、`resistanceLevels`、`signalLevel`、`signalBias`、`confirmationStatus`、多空评分等。

- 指标模块：部分使用 `technicalindicators`（MACD、RSI 等），部分为自定义（ATR、Supertrend 等），实现集中在 `src/views/index/indicators/`。

- 引擎模块：`scoring.js` 提供多空评分汇总，`signalConfirm.js` 提供开仓/平仓的双重确认示例逻辑。

---

## 数据源 / Data Source

- REST：Binance 公共 REST 接口（示例使用 `/api/v3/klines`）。
- WebSocket：示例封装 `wsKline` 可连接 `wss://stream.binance.com:9443/ws/{stream}` 接收实时 kline 数据。

注意：本项目仅用于信号展示、研究与回测示例；真实下单需在后端完成风控与资金管理。

---

## 调试建议 / Tips for Development

- `src/views/index/index.vue` 使用 `@vueuse/core` 的 `useIntervalFn` 实现自动刷新，调整 `refreshIntervalSeconds` 可改变轮询频率。
- 若要验证策略表现，建议准备历史数据脚本并对 `useStrategy` 做单元或集成测试。

---

## 贡献 / Contributing

欢迎 issue 与 PR。提交前请保持代码风格一致并在 PR 描述中说明改动与动机。

---

## 许可证 / License

请根据需要添加 `LICENSE` 文件；当前仓库未包含具体许可证声明。

---

如需继续迭代 README（添加截图、API 文档或贡献模板），回复 “继续”。
