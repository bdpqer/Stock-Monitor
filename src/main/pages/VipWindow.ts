import { AppWindow } from "../base/app_window";

/**
 * Vip窗口
 */
export class VipWindow extends AppWindow{
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 700
       options.height = 700
       options.title = "会员"
    }
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/vip")
    }

    
}