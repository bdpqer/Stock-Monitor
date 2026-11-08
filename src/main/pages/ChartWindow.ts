import { AppWindow } from "../base/app_window";
import { screen } from "electron";
import local_store from "../storage/local_store";

/**
 * Vip窗口
 */
export class ChartWindow extends AppWindow{

    stockKey : any  = null;


    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
       options.width = 400
       options.height = 285
       options.title = "分时"
       options.frame = false;

       let appConfig = local_store;
       options.opacity = appConfig.alpha;

       if(local_store.config.chartBounds){
            let bounds = local_store.config.chartBounds;
            options.x = bounds.x;
            options.y = bounds.y;
            // options.width = bounds.width;
            // options.height = bounds.height;
       }
    }

    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        if (typeof this.stockKey === 'object') {
            let query: string[] = Object.keys(this.stockKey).map((item => {
                return `${item}=${this.stockKey[item]}`
            }))
            win.loadWithRoute("/chart?"+query.join('&'));
        } else {
            win.loadWithRoute("/chart?key="+this.stockKey);
        }
        
    }
    setStock(key:any){
        this.stockKey = key;
    }
    reload(){
        console.log("reload:"+this.stockKey);
        this.win?.webContents.send("reload",this.stockKey);
    }
}