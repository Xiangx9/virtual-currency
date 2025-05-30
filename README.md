  ├─ indicators/             // 所有技术指标
  │    ├─ macd.js
  │    ├─ atr.js
  │    ├─ supertrend.js
  │    ├─ adx.js
  │    └─ ...
  ├─ helpers/
  │    ├─ patterns.js         // K线形态识别
  │    ├─ volumePrice.js      // 量价判断
  │    ├─ tpSl.js             // 止盈止损模块
  │    └─ supportResistance.js
  ├─ engines/
  │    ├─ scoring.js
  │    └─ signalConfirm.js    // 多信号确认逻辑
  ├─ cache/
  │    └─ stateCache.js       // 用于判断信号变化
  └─ index.js                 // useStrategy 主入口
