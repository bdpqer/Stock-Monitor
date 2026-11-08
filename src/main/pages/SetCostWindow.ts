
import process from "process";
import { AppWindow } from "../base/app_window";
import logger from "../service/logger";

/**
 * Vip窗口
 */
export class SetCostWindow extends AppWindow{

    stockKey : string | null = null;

    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 380
        options.center = false;
        // options.x = 0;
        // options.y = 0;
        options.height = 460
        // options.frame = false
        options.title = "更多"
        // options.alwaysOnTop = true;
    }
    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        if(!this.stockKey){
            logger.log("key missing.");
            return;
        }

        win.loadWithRoute("/cost?key="+this.stockKey);
    }
    setStock(key:string){
        this.stockKey = key;
    }
    reload(){
        console.log("reload:"+this.stockKey);
        this.win?.webContents.send("reload",this.stockKey);
    }
}