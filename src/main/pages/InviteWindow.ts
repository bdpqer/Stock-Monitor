import { AppWindow } from "../base/app_window";

/**
 * Vip窗口
 */
export class InviteWindow extends AppWindow{
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 331
       options.height = 404
       options.title = ""
    }
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/invite")
    }
}