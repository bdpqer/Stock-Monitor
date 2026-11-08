import { app, BrowserWindow } from "electron";
import { join } from 'path'

BrowserWindow.prototype.loadWithRoute = function (url: string) {
  if (app.isPackaged) {
    this.loadURL('file://' + join(__dirname, '../renderer/index.html') + `#${url}`,)
  } else {
    this.loadURL(`http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}#${url}`)
  }
}