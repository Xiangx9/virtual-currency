import axios from "axios";
import router from '@/router/index'
import { showMessage } from "./status"; // 引入状态码文件
import { ElMessage } from "element-plus"; // 引入el 提示框，这个项目里用什么组件库这里引什么


// @ts-ignore
axios.defaults.baseURL = "https://api.binance.com";
axios.defaults.headers = {
  //'Content-Type':'application/x-www-form-urlencoded',   // 传参方式表单
  "Content-Type": "application/json;charset=UTF-8", // 传参方式json
};
// 设置接口超时时间
axios.defaults.timeout = 90000;

//http request 拦截器
axios.interceptors.request.use(
  (config) => {
    // 配置请求头
    if (config.url == "/api/goods/upload") {
      axios.defaults.headers['Content-Type'] = "multipart/form-data"; //图片上传
    }
    // console.log("config", config.headers);
    return config;
  },
  (error) => {
    console.log("error", error);
    return Promise.reject(error);
  }
);

//http response 拦截器
axios.interceptors.response.use(
  (response) => {
    // 对响应数据做一些处理
    ElMessage.success(response.data.message);
    return response;
  },
  async (error) => {
    const { response } = error;
    if (response) {
      let message = showMessage(response.status); // 传入响应码，匹配响应码对应信息
      ElMessage.warning(message);
      return Promise.reject(response.data);
    } else {
      ElMessage.warning("网络连接异常,请稍后再试!");
    }
  }
);

// 封装 GET POST 请求并导出
export function request(url = "", params = {}, type = "POST") {
  //设置 url params type 的默认值
  return new Promise((resolve, reject) => {
    let promise;
    if (type.toUpperCase() === "GET") {
      promise = axios({
        url,
        params,
      });
    } else if (type.toUpperCase() === "POST") {
      promise = axios({
        method: "POST",
        url,
        data: params,
      });
    } else if (type.toUpperCase() === "PUT") {
      promise = axios({
        method: "PUT",
        url,
        data: params,
      });
    } else if (type.toUpperCase() === "DELETE") {
      promise = axios({
        method: "delete",
        url,
        params,
      });
    }
    //处理返回
    promise
      .then((res) => {
        console.log("处理返回res", res);
        resolve(res);
      })
      .catch((err) => {
        console.log("处理返回err", err);
        reject(err);
      });
  });
}
