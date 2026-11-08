import { app, BrowserWindow } from "electron";
import { join } from 'path'

BrowserWindow.prototype.loadWithRoute = function (url: string) {
  const host = process.env['VITE_DEV_SERVER_HOST']
  const port = process.env['VITE_DEV_SERVER_PORT']
  // 只有显式配置了 dev server 且处于开发模式时才走 HTTP；
  // 否则（含 npm start 无 dev server 的情况）回退到已构建的本地产物。
  if (!app.isPackaged && host && port) {
    this.loadURL(`http://${host}:${port}#${url}`)
    return
  }
  this.loadURL('file://' + join(__dirname, '../renderer/index.html') + `#${url}`)
}