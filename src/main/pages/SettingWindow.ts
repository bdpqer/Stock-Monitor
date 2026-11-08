import { AppWindow } from "../base/app_window";
import appConfig, { Config } from '../storage/local_store';

/**
 * 主页Window
 */
export class SettingWindow extends AppWindow{

    route : string = "/setting";
    
    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.width = 700
        options.height = 600
        options.title = "设置"
    }
    setRoute(route:string){
        this.route = route;
    }

    configListener: any | null = null;

    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        win.loadWithRoute(this.route)
        
        var that = this;
        this.configListener = (config: Config,diffKeys:any) => {
            that.handleConfigChanged(config,diffKeys);
        }
        appConfig.on('onConfig', this.configListener)
    }

    handleConfigChanged(config: Config,diffKeys:any): void {
        // this.win?.setOpacity(appConfig.alpha)
        this.win?.webContents?.send("app-config", config,diffKeys);
    }
}