import { AppWindow } from "../base/app_window";

/**
 * Vip窗口
 */
export class AdviceWindow extends AppWindow{


    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 380
       options.height = 420
       options.title = "幽灵看盘"
    }

    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute("/advice");
    }
}