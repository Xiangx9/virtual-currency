import { request } from "@/api/axios";

export function getKline(params) {
  return request("/api/v3/klines", params, "get")
}

export function wsKline(streamPath) {
  // 创建 WebSocket 实例（注意：Binance 可能需要指定具体的流路径，例如 "btcusdt@kline_1m"，这里以示例路径演示）
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamPath}`);
  
  // 连接成功时触发
  ws.onopen = () => {
    console.log("WebSocket 连接已建立");
    // 可选：如果需要订阅其他主题，可在此处发送消息（如 Binance 要求的订阅格式）
    // ws.send(JSON.stringify({ method: "SUBSCRIBE", params: ["ethusdt@kline_1m"], id: 1 }));
  };

  // 接收到消息时触发（K线数据会通过此回调返回）
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("收到 K线数据:", data);
  };

  // 连接错误时触发
  ws.onerror = (error) => {
    console.error("WebSocket 连接错误:", error);
  };

  // 连接关闭时触发
  ws.onclose = (event) => {
    console.log(`WebSocket 连接已关闭，代码: ${event.code}, 原因: ${event.reason}`);
    // 可选：自动重连逻辑（根据需求实现）
  };

  // 返回 WebSocket 实例以便外部控制（如关闭连接）
  return ws;
}