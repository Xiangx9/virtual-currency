import './style.css'
import { createApp } from 'vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'

// 创建app
const app = createApp(App)
// 注入
app.use(router)
app.use(ElementPlus)

// 挂载实例
app.mount('#app')
