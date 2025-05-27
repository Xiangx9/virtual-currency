import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import vue from "@vitejs/plugin-vue";
import VueRouter from 'unplugin-vue-router/vite';//引入路由插件
import { codeInspectorPlugin } from 'code-inspector-plugin'; //引入代码检查插件

export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), "");
  console.log('proxy.target', env.VITE_RES_URL);
  return {
    // vite 配置
    base: "/",
    plugins: [
      VueRouter({
        routesFolder: 'src/views',  // 自动生成路由的文件夹
        extensions: ['.vue'],// 生成路由的扩展名
      }), // vite  必须在 vue() 之前调用
      vue(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        resolvers: [ElementPlusResolver()],
        include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: "src/auto-imports.d.ts",
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      codeInspectorPlugin({
        bundler: 'vite',
      }), // 代码检查插件
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // 强制预构建插件包
    optimizeDeps: {
      include: ["axios"],
    },
    // 打包配置
    build: {
      target: "modules",
      outDir: "dist",
      assetsDir: "assets",
      minify: "terser",
    },
    // 本地运行配置，及反向代理配置
    server: {
      host: true,// 允许外部访问
      port: 9000,// 端口号
      strictPort: true,// 设为 true 时若端口已被占用则会直接退出，而不是尝试下一个可用端口。
      hotOnly: false,// 开启热更新
      cors: true,// 允许跨域
      // open: true,// 服务启动时自动在浏览器中打开应用程序
      // proxy: {      // 设置反向代理，根据我们项目实际情况配置,本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
      //   "/api1": {
      //     target: env.VITE_RES_URL, //代理接口
      //     changeOrigin: true,
      //     ws: true,
      //     rewrite: (path) => path.replace(/^\/api1/, ""),
      //   },
      // },
    },
  };
});
