import { screen } from "electron";
import { AppWindow } from "../base/app_window";
import logger from "../service/logger";
import StockUpdateService from '../service/stock';
import appConfig, { Config } from '../storage/local_store';

const HIDE_TYPE_NOHIDE = 0;
const HIDE_TYPE_RIGHT = 1;
const HIDE_TYPE_LEFT = 2;
const HIDE_TYPE_RIGHT_SHOW = 3;
const HIDE_TYPE_LEFT_SHOW = 4;

/**
 * 主页Window
 */
export class IndexWindow extends AppWindow {

    public hideSwitch: boolean = true;
    public hideType: number = HIDE_TYPE_NOHIDE;

    configWindow(options: Electron.BrowserWindowConstructorOptions): void {
        options.alwaysOnTop = true;
        options.center = false;
        options.frame = false;
        options.skipTaskbar = true;
        options.backgroundColor = "#00000000";
        options.thickFrame = false;
        options.hasShadow = false;
        
        if(appConfig.config.windowTransparent){
            options.transparent = true;
            options.resizable = false;
        }else{
            options.transparent = false;
            options.resizable = false;
        }

        let bounds = appConfig.config.bounds;
        if (bounds == null) {
            let sb = screen.getPrimaryDisplay().bounds
            let y = sb.y + sb.height - 150
            let x = sb.x + sb.width - 250
            bounds = { x: x, y: y, width:  250, height: 150 }
        }
        if (bounds) {
            options.x = bounds.x;
            options.y = bounds.y;
            options.width = bounds.width;
            options.height = bounds.height;
        }
    }

    configListener: any | null = null

    onWindowCreated(win: Electron.CrossProcessExports.BrowserWindow): void {
        StockUpdateService.attachWebContents(win.webContents)
        var that = this;
        this.configListener = (config: Config,diffKeys:any) => {
            that.handleConfigChanged(config,diffKeys);
        }
        appConfig.on('onConfig', this.configListener)
        appConfig.editWith((cfg) => { cfg.bounds = null })

        if(process.platform=="win32"){
            win.setAlwaysOnTop(true,"normal")
        }
        win.setOpacity(appConfig.alpha)
        win.loadWithRoute("/")
    }

    onWindowClosed(win: Electron.CrossProcessExports.BrowserWindow): void {
        StockUpdateService.detachWebContents(win.webContents)
        if (this.configListener) {
            appConfig.removeListener('onConfig', this.configListener)
        }
    }

    onWindowBoundsChanged(bounds: Electron.Rectangle | undefined): void {
        if (bounds) {
            // appConfig.editWith((cfg) => {
            //     cfg.bounds = bounds
            // })
        }
    }

    onWindowBlur(){
        // this.hideIfOnScreenBorder();
    }

    handleConfigChanged(config: Config,diffKeys:any): void {
        this.win?.setOpacity(appConfig.alpha)
        this.win?.webContents?.send("app-config", config,diffKeys);

        if(diffKeys[0]=="hideSwitch"){
            if(config.hideSwitch==false){
                this.showIfOnScreenBorder();
            }

            this.hideSwitch = config.hideSwitch;
        }
    }

    getBounds():any{
        return this.win?.getBounds();
    }

    hideIfOnScreenBorder(){
        if(this.hideSwitch==false){
            return;
        }

        let bounds:any = this.win?.getBounds();
        let sb = screen.getDisplayMatching(bounds).bounds;
        if(!sb){
            logger.log("sb invalide.")
            return;
        }
        
        let showSize = 5;
        if(bounds&&(bounds.x+bounds.width)>=(sb.x+sb.width)){
            let tox = sb.x+sb.width - showSize;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_RIGHT;

            StockUpdateService.setIndexWindowVisible(false);
        }else if(bounds&&bounds.x<=sb.x){
            let tox = sb.x+showSize - bounds.width;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_LEFT;

            StockUpdateService.setIndexWindowVisible(false);
        }
    }

    showIfOnScreenBorder(){
        if(this.hideSwitch==false){
            return;
        }

        let bounds:any = this.win?.getBounds();
        if (!bounds){
            logger.log("bounds invalide.")
            return;
        }
        let sb = screen.getDisplayMatching(bounds).bounds;
        if(this.hideType == HIDE_TYPE_RIGHT){
        // if(bounds&&(bounds.x+bounds.width)>=(sb.x+sb.width)){
            let tox = sb.x+sb.width - bounds.width;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_RIGHT_SHOW;

            StockUpdateService.setIndexWindowVisible(true);
            StockUpdateService.forceUpdate();
        // }else if(bounds&&bounds.x<=sb.x){
        }else if(this.hideType == HIDE_TYPE_LEFT){
            let tox = sb.x;
            let toy = bounds.y;
            this.setPosition(Math.floor(tox),Math.floor(toy));

            this.hideType = HIDE_TYPE_LEFT_SHOW;

            StockUpdateService.setIndexWindowVisible(true);
            StockUpdateService.forceUpdate();
        }
    }

    setToCenter(){
        let bounds:any = this.win?.getBounds();
        let sb = screen.getPrimaryDisplay().bounds;
        let cx = sb.width/2 - bounds.width/2;
        let cy = sb.height/2 - bounds.height/2;
        cx = Math.floor(cx);
        cy = Math.floor(cy);
        this.setPosition(cx,cy);
    }

    showOnScreen(){
        super.showOnScreen();

        StockUpdateService.setIndexWindowVisible(true);
    }

    hideFromScreen(){
        super.hideFromScreen();

        StockUpdateService.setIndexWindowVisible(false);
    }
    
}