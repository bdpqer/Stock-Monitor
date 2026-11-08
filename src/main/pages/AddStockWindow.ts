import { AppWindow } from "../base/app_window";

/**
 *  添加
 */
export class AddStockWindow extends AppWindow {

    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 680
        options.height = 371
        options.frame = false
    }
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/addstock")
    }


}