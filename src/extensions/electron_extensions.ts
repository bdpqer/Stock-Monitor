// 模块职责：在 Electron 的 BrowserWindow 原型上扩展 loadWithRoute 方法，
// 使主进程能以「哈希路由」方式打开页面。开发环境从 Vite dev server 加载，
// 生产/打包环境则加载本地构建产物 renderer/index.html。
import { app, BrowserWindow } from "electron";
import { join } from 'path'

// 扩展方法：加载指定哈希路由（url 形如 "/some-route"），内部拼接为 `${host}#${url}`
BrowserWindow.prototype.loadWithRoute = function (url: string) {
  // dev server 的地址与端口由 Vite 相关的环境变量注入
  const host = process.env['VITE_DEV_SERVER_HOST']
  const port = process.env['VITE_DEV_SERVER_PORT']
  // 只有显式配置了 dev server 且处于开发模式时才走 HTTP；
  // 否则（含 npm start 无 dev server 的情况）回退到已构建的本地产物。
  if (!app.isPackaged && host && port) {
    // 开发模式：打开 Vite dev server，通过 # 携带哈希路由实现热更新调试
    this.loadURL(`http://${host}:${port}#${url}`)
    return
  }
  // 生产/打包模式：以 file 协议打开本地构建好的 renderer 入口并拼上哈希路由
  this.loadURL('file://' + join(__dirname, '../renderer/index.html') + `#${url}`)
}